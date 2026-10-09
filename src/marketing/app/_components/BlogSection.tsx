import Link from 'next/link'
import { developersPath } from '../_lib/developersPaths'
import FeaturedVisual from '../blog/_components/FeaturedVisual'
import { formatDate } from '../blog/_lib/categories'
import { getAllPosts, getFeaturedPost } from '../blog/_lib/posts'
import * as ui from './BlogSection.recipes'
import EdgeMarkers from './EdgeMarkers'
import Reveal from './Reveal'

export default function BlogSection() {
  const posts = getAllPosts()
  const featured = getFeaturedPost(posts)
  const latest = posts.filter((p) => p.slug !== featured.slug).slice(0, 4)

  return (
    <section>
      <Reveal className={ui.reveal().className}>
        <h2 {...ui.blogSectionHeading()}>Dive deeper into Tempo&apos;s engineering</h2>
        <p {...ui.blogSectionDescription()}>
          Product announcements, engineering deep dives, network upgrades, events, and case studies{' '}
          <span {...ui.blogSectionText()}>from the team building Tempo.</span>
        </p>
      </Reveal>

      <Reveal className={ui.reveal2().className}>
        <Link
          href={developersPath(`/blog/${featured.slug}`)}
          className={ui.link({ className: 'group' }).className}
        >
          <div {...ui.blogSectionLayout()}>
            <FeaturedVisual />
          </div>
          <div {...ui.blogSectionLayout2()}>
            <h3 {...ui.blogSectionHeading2()}>{featured.title}</h3>
            <p {...ui.blogSectionDescription2()}>{featured.excerpt}</p>
            <p {...ui.blogSectionDescription3()}>{formatDate(featured.date)}</p>
          </div>
        </Link>
      </Reveal>

      <div {...ui.blogSectionLayout3()}>
        <EdgeMarkers wideOnly />
        <ul>
          {latest.map((post, i) => (
            <li key={post.slug}>
              <Reveal delay={i * 50}>
                <Link
                  href={developersPath(`/blog/${post.slug}`)}
                  className={ui.link2({ className: 'group' }).className}
                >
                  <span {...ui.blogSectionText2()}>{post.title}</span>
                  <span {...ui.blogSectionText3()}>
                    <span {...ui.blogSectionText4()}>{formatDate(post.date)}</span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
        <Reveal>
          <Link href={developersPath('/blog')} className={ui.link3().className}>
            View all blogs
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
