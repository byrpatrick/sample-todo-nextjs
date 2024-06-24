import { faker } from '@faker-js/faker';
import { prisma } from 'server/db';
import { hash } from 'bcryptjs';
import { exec } from 'child_process';
import util from 'util';

export const createUser = async (password: string) => {
  const email = faker.internet.email();
  const hashedPassword = await hash(password, 12);

  return await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
    },
  });
};

export const createUserWithSpace = async (password: string, space: { name: string; slug: string }) => {
  const email = faker.internet.email();
  const hashedPassword = await hash(password, 12);

  return await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      spaces: {
        create: {
          role: 'ADMIN',
          space: {
            create: {
              name: space.name,
              slug: space.slug,
            },
          },
        },
      },
    },
  });
};

export const createUserOnSharedSpace = async (password: string, space: { slug: string }) => {
  const email = faker.internet.email();
  const hashedPassword = await hash(password, 12);
  const existingSpace = await prisma.space.findFirstOrThrow({
    where: {
      slug: space.slug,
    },
  });

  const result = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      spaces: {
        create: {
          role: 'USER',
          spaceId: existingSpace.id,
        },
      },
    },
  });

  return result;
};

const execPromise = util.promisify(exec);

export const resetDatabase = async () => {
  try {
    await execPromise(`npx prisma migrate reset --force --skip-seed`);

    console.log('Database reset successfully.');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
};
