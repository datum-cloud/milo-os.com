import { marked } from 'marked';
import { graphql } from '@octokit/graphql';
import { dbConnect, refreshIssues, getIssues } from '@libs/postgres';
import type { IssuesProps } from '@libs/postgres';

type GitHubGraphQLResponse = {
  repository: {
    issues: {
      nodes: [
        {
          id: string;
          title: string;
          body: string;
          url: string;
          labels: {
            nodes: Array<{
              name: string;
            }>;
          };
        },
      ];
    };
  };
};

function isConnectedToDB(): boolean {
  try {
    const sql = dbConnect();
    return !!sql;
  } catch {
    return false;
  }
}

function isOverOneHourAgo(date: Date): boolean {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  return date < oneHourAgo;
}

async function getRoadmap(userId: string | null) {
  let issues: IssuesProps[] = await getIssues();

  try {
    if (issues && issues.length > 0) {
      if (isOverOneHourAgo(issues[0].updated_at)) {
        // take the first issue's updated_at date to check if it's over one hour ago
        issues = await getIssuesFromGithub();
        await refreshIssues(issues);
      }
    } else {
      issues = await getIssuesFromGithub();
      await refreshIssues(issues);
    }
  } catch (error) {
    console.error(
      'Fetching issues from the remote & db failed: ',
      error instanceof Error ? error.message : String(error)
    );
  }

  return assignAdditionalDataToIssue(issues, userId);
}

async function graphqlWithAppAuth(appId: number, installationId: number, privateKey: string) {
  const { createAppAuth } = await import('@octokit/auth-app');
  const auth = createAppAuth({
    appId,
    privateKey,
    installationId,
  });

  return graphql.defaults({
    request: {
      hook: auth.hook,
    },
  });
}

async function getIssuesFromGithub(): Promise<IssuesProps[]> {
  const appId = import.meta.env.APP_ID || process.env.APP_ID;
  const privateKey = import.meta.env.APP_PRIVATE_KEY || process.env.APP_PRIVATE_KEY;
  const installationId = parseInt(
    import.meta.env.APP_INSTALLATION_ID || process.env.APP_INSTALLATION_ID || '0',
    10
  );

  if (!appId || !installationId || !privateKey) {
    return [];
  }

  const roadmap_user = import.meta.env.ROADMAP_USER || process.env.ROADMAP_USER || 'datum-cloud';
  const roadmap_repo = import.meta.env.ROADMAP_REPO || process.env.ROADMAP_REPO || 'milo';
  const labels = import.meta.env.ROADMAP_LABELS || process.env.ROADMAP_LABELS || '';
  const roadmap_labels = labels
    .split(',')
    .map((label: string) => `"${label.trim()}"`)
    .join(',');

  const graphqlWithAuth = await graphqlWithAppAuth(
    Number(appId),
    Number(installationId),
    privateKey
  );
  console.log(
    '------ Fetching issues from GitHub:',
    `${roadmap_user}/${roadmap_repo} -- labels: ${roadmap_labels}`
  );

  if (!roadmap_user || !roadmap_repo) {
    return [];
  }

  const jsonData: GitHubGraphQLResponse = await graphqlWithAuth(
    `
      query {
        repository(owner: "${roadmap_user}", name: "${roadmap_repo}") {
          issues(last: 50, filterBy: {states: OPEN, labels: [${roadmap_labels}]}) {
            nodes {
              id
              title
              body
              url
              labels(first: 10) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    `
  );

  const issues: IssuesProps[] = Object(jsonData.repository.issues.nodes).map(
    (issue: IssuesProps) => ({
      ...issue,
    })
  );

  return issues;
}

async function assignAdditionalDataToIssue(
  source: object,
  userId: string | null
): Promise<object[]> {
  const newIssues: object[] = [];
  let votesMap = new Map();

  if (!Array.isArray(source)) {
    throw new TypeError('Expected source to be an array');
  }

  for (const issue of source) {
    const issueId = issue.id;
    const modifyProject = {
      id: issue.id,
      title: issue.title,
      body: issue.body ? marked.parse(issue.body) : '',
      url: issue.url,
      labels: issue.labels,
    };

    newIssues.push({
      ...modifyProject,
    });
  }

  return newIssues;
}

export { getRoadmap, isConnectedToDB };
