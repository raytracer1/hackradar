const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const platforms = [
    { name: 'Devpost', slug: 'devpost', websiteUrl: 'https://devpost.com' },
    { name: 'MLH', slug: 'mlh', websiteUrl: 'https://mlh.io' },
    { name: 'HackerEarth', slug: 'hackerearth', websiteUrl: 'https://www.hackerearth.com' },
    { name: 'Devfolio', slug: 'devfolio', websiteUrl: 'https://devfolio.co' },
    { name: 'Unstop', slug: 'unstop', websiteUrl: 'https://unstop.com' },
  ];

  for (const p of platforms) {
    await prisma.platform.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log('Platforms seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
