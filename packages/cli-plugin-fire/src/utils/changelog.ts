import { htmlEscape } from './escape-got';
import * as git from './git';

// eslint-disable-next-line import/prefer-default-export
export const getChangelog = async (repoUrl?: string) => {
  if (!repoUrl) {
    throw new Error(`get changelog failed, no repo url was found.`);
  }
  const latest = await git.latestTagOrFirstCommit();
  const log = await git.commitLogFromRevision(latest);

  if (!log) {
    throw new Error(`get changelog failed, no new commits was found.`);
  }

  const commits = log.split('\n').map((commit) => {
    const splitIndex = commit.lastIndexOf(' ');
    return {
      message: commit.slice(0, splitIndex),
      id: commit.slice(splitIndex + 1)
    };
  });

  console.log(htmlEscape);

  return (nextTag: string) =>
    `${commits
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      .map((commit) => `- ${htmlEscape(commit.message)}  ${commit.id}`)
      .join('\n')}\n\n${repoUrl}/compare/${latest}...${nextTag}`;
};
