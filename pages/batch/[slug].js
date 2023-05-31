import { useRouter } from 'next/router';
import { sql } from "@vercel/postgres";
import Link from 'next/link';

export async function getServerSideProps(context) {

  const { slug } = context.query;

  try {
    const { rows: batches } = await sql`SELECT * from Batches where slug = ${slug}`;
    for (const batch of batches) {
    const { rows: contributors } = await sql`
    SELECT c.*, a.*
    FROM contributions AS c
    JOIN authors AS a ON c.author_id = a.id
    WHERE c.content_id = ${batch.id}
  `;

    const { rows: batchParts } = await sql`
    SELECT *
    FROM batchparts
    WHERE batch_id = ${batch.id}
    `;

    const jams = [];
    for (const batchPart of batchParts) {
      const { rows: jam } = await sql`
        SELECT *
        FROM jams
        WHERE id = ${batchPart.jam_id}
      `;
      jams.push(jam[0]);
    }
    
    batch.jams = jams
    batch.contributors = contributors
    }

    // Fetch any additional data you need for the batch page

    return {
      props: {
        batch: batches[0],
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        batch: null,
      },
    };
  }
}

export default function BatchPage({ batch }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!batch) {
    return <div>Batch not found</div>;
  }

  return (
    <div onClick={() => console.log(batch)}>
      <h1>{batch.title}</h1>
      <p>{batch.description}</p>
      <div>
        {batch.contributors && batch.contributors.map((contributor) => (
          <div key={contributor.id} style={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
            <img src={contributor.profile_picture} style={{ width: 32, borderRadius: "100%", height: 32 }} />
            <p style={{ marginLeft: 8 }}>{contributor.name}</p>
          </div>
        ))}
      </div>
      <p>{batch.content}</p>

      {batch.jams.map((jam) => 
            <Link href={`/jam/${jam.slug}`} as={`/jam/${jam.slug}`}>

            <div key={jam.id}>
              <p>{jam.topic}</p>
              <p>{jam.difficulty}</p>
              <p>{jam.length}</p>
              <p>{jam.title}</p>
            </div>
            </Link>
          )} 
      {/* Render the rest of the batch content */}
    </div>
  );
}
