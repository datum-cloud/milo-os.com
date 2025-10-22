async function extractHeader(markdown: string = ''): Promise<object> {
  const headingRegex = /^(#+)\s(.+)$/gm;
  const headings: string[] = [];
  const paragraphRegex = /(^|\n\n)([^\n#].*?)(?=\n\n|$)/gs;
  const paragraphs: string[] = [];

  let headingMatch;
  let paragraphMatch;
  let glossary: Record<string, { title: string; description: string }> = {};

  while ((paragraphMatch = paragraphRegex.exec(markdown)) !== null) {
    // Filter out empty matches or lines that are clearly not paragraphs (e.g., list items, code blocks)
    const text = paragraphMatch[2].trim();
    if (text && !text.startsWith('-') && !text.startsWith('*') && !text.startsWith('`')) {
      paragraphs.push(text);
    }
  }

  while ((headingMatch = headingRegex.exec(markdown)) !== null) {
    headings.push(headingMatch[2]); // Capture group 2 contains the heading text
  }

  headings.forEach((heading, index) => {
    glossary = {
      ...glossary,
      [heading.toLowerCase()]: { title: heading, description: paragraphs[index] },
    };
  });

  if (Object.keys(glossary).length === 0) {
    return {};
  }

  return glossary;
}

export { extractHeader };
