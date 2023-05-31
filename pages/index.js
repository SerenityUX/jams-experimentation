import Head from 'next/head'
import { Container } from 'theme-ui'
import { sql } from "@vercel/postgres";
import Link from 'next/link';

export async function getServerSideProps() {
  try {
    const { rows: stories } = await sql`SELECT * from Stories`;
    for (const story of stories) {
      const contributors = await sql`
      SELECT c.*, a.*
      FROM contributions AS c
      JOIN authors AS a ON c.author_id = a.id
      WHERE c.content_id = ${story.id}
      `;

      story.contributors = contributors.rows;
    }

    // Retrieve the batches
    const { rows: batches } = await sql`SELECT * FROM batches`;

    // Loop through the batches and fetch the corresponding tags
    for (const batch of batches) {
      const { rows: tags } = await sql`
        SELECT content
        FROM tags
        WHERE type = 'Batches' AND content_id = ${batch.id}
      `;

      // Map the tags to an array of strings
      const tagArray = tags.map((tag) => tag.content);

      // Update the batch object with the tags attribute
      batch.tags = tagArray;
    }

   

    // Retrieve the batches
    const { rows: jams } = await sql`SELECT * FROM jams`;

    // Loop through the batches and fetch the corresponding tags
    for (const jam of jams) {
      const { rows: tags } = await sql`
        SELECT content
        FROM tags
        WHERE type = 'Jams' AND content_id = ${jam.id}
      `;

      // Map the tags to an array of strings
      const tagArray = tags.map((tag) => tag.content);

      // Update the batch object with the tags attribute
      jam.tags = tagArray;
    }

    return {
      props: {
        stories,
        batches,
        jams
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        stories: null,
        batches: null
      },
    };
  }
}

export default function Home({ stories, batches, jams }) {
  return (
    <>
      <Head>
        <title>Jams</title>
        <meta name="description" content="Collaborate with Your Club" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container>
          <p>Code Jams</p>
          <p>
          Collaborative coding workshops where sparks ignite, fears dissolve, and inventions come to life.
          </p>
          {stories && stories.map((story) => (
           <Link href={`/story/${story.slug}`} as={`/story/${story.slug}`}>

            <div key={story.id}>
              <p>{story.title}</p>
              <p>{story.description}</p>
              {story.contributors.map((contributor) => 
                <div key={contributor.id} style={{flexDirection: "row", display: "flex", alignItems: "center"}}>
                  <img src={contributor.profile_picture} style={{width: 32, borderRadius: "100%", height: 32}}></img>
                  <p style={{marginLeft: 8}}>{contributor.name}</p>
                </div>
              )}
            </div>
            </Link>
          ))}
          <p>Batch Jam Recipes (multi-part workshops)</p>
            {batches.map((batch) => 
            <Link href={`/batch/${batch.slug}`} as={`/batch/${batch.slug}`}>

            <div  key={batch.id}>
              <p>{batch.title}</p>
              <p>{batch.description}</p>
              {batch.tags.map((tag) => 
                <p key={tag}>{tag}</p>
              )}
            </div>
            </Link>
            )}
          <p>Individual Jam Recipes (single-part workshops)</p>
          {jams.map((jam) => 
            <Link href={`/jam/${jam.slug}`} as={`/jam/${jam.slug}`}>

            <div key={jam.id}>
              <p>{jam.topic}</p>
              <p>{jam.difficulty}</p>
              <p>{jam.length}</p>
              <p>{jam.title}</p>
            </div>
            </Link>
          )}
        </Container>
      </main>
    </>
  )
}
