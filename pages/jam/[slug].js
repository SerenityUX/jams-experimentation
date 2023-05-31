import { useRouter } from 'next/router';
import { sql } from "@vercel/postgres";
import Link from 'next/link';

export async function getServerSideProps(context) {

  const { slug } = context.query;

  try {
    const { rows: jams } = await sql`SELECT * from jams where slug = ${slug}`;
    for (const jam of jams) {
      const contributors = await sql`
      SELECT c.*, a.*
      FROM contributions AS c
      JOIN authors AS a ON c.author_id = a.id
      WHERE c.content_id = ${jam.id}
      `;

      jam.contributors = contributors.rows;
    }

    // Fetch any additional data you need for the jam page

    return {
      props: {
        jam: jams[0],
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        jam: null,
      },
    };
  }
}

export default function jamPage({ jam }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!jam) {
    return <div>jam not found</div>;
  }

  return (
    <div>
      <h1>{jam.title}</h1>
      <p>{jam.description}</p>
      <div>
      {jam.contributors.map((contributor) => 
      <div>
        <div key={contributor.id} style={{flexDirection: "row", display: "flex", alignItems: "center"}}>
          <img src={contributor.profile_picture} style={{width: 32, borderRadius: "100%", height: 32}}></img>
          <p style={{marginLeft: 8}}>{contributor.name}</p>
        </div>
        <p>{contributor.description}</p>
      </div>
      )}
      </div>
      <p>{jam.content}</p>

      {/* Render the rest of the jam content */}
    </div>
    )
}