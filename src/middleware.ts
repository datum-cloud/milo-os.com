import { stargazerCount } from '@libs/milo';

interface Context {
  locals: {
    starCount?: string;
  };
}

type NextFunction = () => Promise<void>;

export async function onRequest(context: Context, next: NextFunction) {
  const starCount = await stargazerCount();
  const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });
  const formattedStarCount = formatter.format(starCount);

  context.locals.starCount = formattedStarCount;

  return next();
}
