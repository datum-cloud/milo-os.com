import { graph } from '@/src/libs/github';
import { Cache } from '@libs/cache';

const cache = new Cache('.cache');
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

  let stargazers = 0;
  const name = 'milo';

  if (cache.has('stargazerCount')) {
    return cache.get<number>('stargazerCount') as number;
  } else {
    if (isClientSide) {
      try {
        const API_URL = `https://api.github.com/repos/${owner}/${name}`;
        const response = await fetch(API_URL);
        const data = await response.json();

        if (response.ok) {
          stargazers = data.stargazers_count || 0;
          cache.set('stargazerCount', stargazers, 1000 * 60 * 10); // cache for 10 minutes
        }
      } catch {
        stargazers = 0;
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
        stargazers = response.repository.stargazerCount || 0;
        cache.set('stargazerCount', stargazers, 1000 * 60 * 10); // cache for 10 minutes
      } catch {
        stargazers = 0;
      }
    }

    return stargazers;
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
  let roadmaps: RoadmapProps[] = [];

  if (cache.has('roadmaps')) {
    return cache.get<RoadmapProps[]>('roadmaps') as RoadmapProps[];
  } else {
    console.log('==Fetching roadmaps from GitHub API');
    const name = import.meta.env.ROADMAP_REPO || process.env.ROADMAP_REPO || 'milo';
    const arrLabel = import.meta.env.ROADMAP_LABELS || process.env.ROADMAP_LABELS || '';
    const labels = arrLabel
      .split(',')
      .map((label: string) => `"${label.trim()}"`)
      .join(',');

    const query = `
        query ($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            issues(first: 20, filterBy: { states: OPEN, labels: ["enhancement"] }) {
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
    roadmaps = Object(response.repository.issues.nodes).map((issue: RoadmapProps) => ({
      ...issue,
    }));

    cache.set('roadmaps', roadmaps, 1000 * 60 * 10); // cache for 30 minutes
    return roadmaps;
  }
}

async function changelogs(): Promise<ChangelogProps[]> {
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

  const name = 'datum';
  let changelogs: ChangelogProps[] = [];
  const categoryVariables = {
    owner,
    name,
    slug: 'changelog',
  };

  if (cache.has('changelogs')) {
    return cache.get<ChangelogProps[]>('changelogs') as ChangelogProps[];
  } else {
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
    changelogs = Object(response.repository.discussions.nodes).map((log: ChangelogProps) => ({
      ...log,
    }));
    cache.set('changelogs', changelogs, 1000 * 60 * 10); // cache for 10 minutes
  }

  return changelogs;
}

export { stargazerCount, roadmaps, changelogs, type RoadmapProps, type ChangelogProps };
