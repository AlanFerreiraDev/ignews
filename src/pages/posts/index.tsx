import Head from 'next/head';
import React from 'react';

import styles from './styles.module.scss';

const Posts = () => {
  return (
    <>
      <Head>
        <title>Posts | IgNews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          <a href="#">
            <time>12 de março de 2021</time>
            <strong>Creating a Monorepo with LernA & Yarn Workspaces</strong>
            <p>
              In this guide, you will learn how to create a Monorepo to manage
              multiple pacjkages with a shared build, test, and release process{' '}
            </p>
          </a>
          <a href="#">
            <time>12 de março de 2021</time>
            <strong>Creating a Monorepo with LernA & Yarn Workspaces</strong>
            <p>
              In this guide, you will learn how to create a Monorepo to manage
              multiple pacjkages with a shared build, test, and release process{' '}
            </p>
          </a>
          <a href="#">
            <time>12 de março de 2021</time>
            <strong>Creating a Monorepo with LernA & Yarn Workspaces</strong>
            <p>
              In this guide, you will learn how to create a Monorepo to manage
              multiple pacjkages with a shared build, test, and release process{' '}
            </p>
          </a>
        </div>
      </main>
    </>
  );
};

export default Posts;
