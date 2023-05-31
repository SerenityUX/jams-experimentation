import { useRouter } from 'next/router';
import { sql } from "@vercel/postgres";

export async function getServerSideProps(context) {
  const { slug } = context.query;

  try {
    const { rows: stories } = await sql`SELECT * from Stories where slug = ${slug}`;
    for (const story of stories) {
      const contributors = await sql`
      SELECT c.*, a.*
      FROM contributions AS c
      JOIN authors AS a ON c.author_id = a.id
      WHERE c.content_id = ${story.id}
      `;

      story.contributors = contributors.rows;
    }

    // Fetch any additional data you need for the story page

    return {
      props: {
        story: stories[0],
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        story: null,
      },
    };
  }
}

export default function StoryPage({ story }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!story) {
    return <div>Story not found</div>;
  }

  return (
    <div>
      <h1>{story.title}</h1>
      <p>{story.description}</p>
      <div>
      {story.contributors.map((contributor) => 
      <div>
        <div key={contributor.id} style={{flexDirection: "row", display: "flex", alignItems: "center"}}>
          <img src={contributor.profile_picture} style={{width: 32, borderRadius: "100%", height: 32}}></img>
          <p style={{marginLeft: 8}}>{contributor.name}</p>
        </div>
        <p>{contributor.description}</p>
      </div>
      )}
      </div>
      <p>{story.content}</p>

      {/* Render the rest of the story content */}
    </div>
  );
}
