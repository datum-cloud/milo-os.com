import { graph } from '@/src/libs/github';

const owner = 'datum-cloud';

type RoadmapProps = {
  id: string;
  title: string;
  body: string;
  url: string;
  labels?: { nodes: Array<{ name: string }> };
  hasVoted?: boolean;
  updated_at: Date;
};

type ChangelogProps = {
  id: string;
  title: string;
  body: string;
  url: string;
  publishedAt: Date;
  tags?: Array<string>;
};

async function stargazerCount(isClientSide: boolean = false): Promise<number> {
  type ResponseProps = {
    repository: {
      stargazerCount: number;
    };
  };

  const name = 'milo';

  if (isClientSide) {
    try {
      const API_URL = `https://api.github.com/repos/${owner}/${name}`;
      const response = await fetch(API_URL);
      const data = await response.json();

      if (response.ok) {
        return data.stargazers_count || 0;
      } else {
        return 0;
      }
    } catch {
      return 0;
    }
  } else {
    try {
      const query = `
      query ($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          stargazerCount
        }
      }
    `;

      const variables = {
        owner,
        name,
      };

      const response = (await graph(query, variables)) as ResponseProps;
      return response.repository.stargazerCount || 0;
    } catch {
      return 0;
    }
  }
}

async function roadmaps(): Promise<RoadmapProps[]> {
  type ResponseProps = {
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

  const name = import.meta.env.ROADMAP_REPO || process.env.ROADMAP_REPO || 'milo';
  const arrLabel = import.meta.env.ROADMAP_LABELS || process.env.ROADMAP_LABELS || '';
  const labels = arrLabel
    .split(',')
    .map((label: string) => `"${label.trim()}"`)
    .join(',');

  const query = `
      query ($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          issues(first: 50, filterBy: { states: OPEN, labels: ["enhancement"] }) {
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
    `;

  const variables = {
    owner: owner,
    name: name,
    labels: labels,
  };

  const response = (await graph(query, variables)) as ResponseProps;
  const roadmaps: RoadmapProps[] = Object(response.repository.issues.nodes).map(
    (issue: RoadmapProps) => ({
      ...issue,
    })
  );

  return roadmaps;
}

async function changelogs(): Promise<ChangelogProps[]> {
  const name = 'datum';

  type ResponseProps = {
    repository: {
      discussions: {
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

  // const categoryId = 'DIC_kwDONK56Bc4CwCgV'; // Changelog category ID
  const categoryVariables = {
    owner,
    name,
    slug: 'changelog',
  };

  const categoryQuery = `
    query ($owner:String!, $name:String!, $slug:String!) {
      repository(owner: $owner, name: $name) {
        discussionCategory(slug: $slug){
          id,
        }
      }
    }`;

  const categoryResponse = (await graph(categoryQuery, categoryVariables)) as {
    repository: { discussionCategory: { id: string } };
  };

  const categoryId = categoryResponse.repository.discussionCategory.id as string;

  const query = `
    query ($owner:String!, $name:String!, $categoryId:ID!) {
      repository(owner: $owner, name: $name) {
        discussions(first: 30, after: null, categoryId: $categoryId) {
          nodes {
            id,
            title,
            body,
            createdAt,
            labels (first: 5, last: null) {
              nodes {
                name,
                color,
              }
            },
          }
        }
      }
    }
  `;

  const variables = {
    owner,
    name,
    categoryId,
  };

  const response = (await graph(query, variables)) as ResponseProps;
  const changelogs: ChangelogProps[] = Object(response.repository.discussions.nodes).map(
    (log: ChangelogProps) => ({
      ...log,
    })
  );

  return changelogs;
}

export { stargazerCount, roadmaps, changelogs, type RoadmapProps, type ChangelogProps };
