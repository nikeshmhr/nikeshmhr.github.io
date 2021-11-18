/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

const Bio = () => {
  return (
    <div className="bio">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile_picture.png"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      <p>
        <strong>Building & Breaking Stuff...</strong>
        <p>Enjoy!!!</p>
      </p>
    </div>
  )
}

export default Bio
