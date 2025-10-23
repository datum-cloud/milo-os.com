import { z, reference, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const metaSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    og: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        url: z.string().optional(),
        article: z.boolean().default(false).optional(),
        published: z.date().optional(),
        author: z.string().optional(),
      })
      .optional(),
  })
  .optional();

const featuresSchema = z.array(
  z
    .object({
      group: z.string().optional(),
      items: z.array(
        z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          icon: z.string().optional(),
        })
      ),
    })
    .optional()
);

// Define pages collections
const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      iconName: z.string().optional(),
      featuredImage: image().optional(),
      slug: z.string().optional(),
      order: z.number().optional().default(0),
      contents: z.array(reference('pages')).optional(),
      items: z.array(z.string()).optional(),
      updatedDate: z.string().optional(),
      features: featuresSchema.optional(),
      images: z
        .array(
          z.object({
            img: image().optional(),
            alt: z.string().optional(),
          })
        )
        .optional(),
      pageInfo: z
        .array(
          z.object({
            icon: z.string(),
            text: z.string(),
          })
        )
        .optional(),
      meta: metaSchema,
    }),
});

// Define legal collections
const legal = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/legal' }),
  schema: () =>
    z.object({
      title: z.string(),
      slug: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      iconName: z.string().optional(),
      meta: metaSchema,
    }),
});

export const collections = {
  pages,
  legal,
};
