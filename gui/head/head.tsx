import { ButtonOld } from "components/ButtonOld/ButtonOld";
import { frontend } from "lib/env/env";
import { hasura } from "lib/env/env";
import { Toast } from "gui/toast/toast";
import { useRouter } from "next/router";
import Head from "next/head";
import React from "react";

import dynamic from "next/dynamic";

const FaviconLoading = dynamic(() => import("./FaviconLoading"), {
  ssr: false,
});

interface Props {
  title?: string;
  description?: string;
  robots?: string;
  preview?: boolean;
  imageUrl?: string;
  screenshot?: string;
  loading?: boolean;
}

export const PageHead: React.FC<Props> = (props) => {
  const title = props.title ?? "Dune";
  const origin = frontend();
  const _description = truncateDescription(
    props.description || defaultDescription
  );

  let image: string;
  if (props.screenshot) {
    image = origin + `/api/screenshot?url=${props.screenshot}`;
  } else if (props.imageUrl) {
    image = props.imageUrl;
  } else {
    image = origin + "/assets/poster-1440w.png";
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta name="twitter:title" content={title} />
        <meta property="og:image" content={image} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:description" content={_description} />
        <meta name="description" content={_description} />
        <meta property="og:description" content={_description} />
        {props.robots && <meta name="robots" content={props.robots} />}
      </Head>
      {/* Render Favicon components outside <Head>. Can only render native elements as children of <Head>. */}
      {props.loading ? <FaviconLoading /> : <Favicon />}
      {props.preview && (
        <Toast>
          <form action="/api/preview">
            <ButtonOld type="submit" color1>
              Exit preview
            </ButtonOld>
          </form>
        </Toast>
      )}
    </>
  );
};

function Favicon() {
  return (
    <Head>
      <link
        rel="icon"
        type="image/png"
        sizes="1024x1024"
        href="/assets/glyph-1024w.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="512x512"
        href="/assets/glyph-512w.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="256x256"
        href="/assets/glyph-256w.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="128x128"
        href="/assets/glyph-128w.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="64x64"
        href="/assets/glyph-64w.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/assets/glyph-32w.png"
      />
    </Head>
  );
}

export const AppHead: React.FC = () => {
  const { asPath } = useRouter();
  const origin = frontend();

  // The special "-data" page slugs should not be indexed.
  // These slugs only hold data for other pages that have their own routes.
  const robots = asPath.endsWith("-data") ? "noindex" : "";

  return (
    <Head>
      <link rel="preconnect" href={hasura()} />
      <link rel="preload" href={hasura()} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:domain" content={origin} />
      <meta name="twitter:site" content="@DuneAnalytics" />
      <meta name="twitter:creator" content="@DuneAnalytics" />
      {robots && <meta name="robots" content={robots} />}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, minimum-scale=1, shrink-to-fit=no"
      />
    </Head>
  );
};

const defaultDescription = [
  "Blockchain ecosystem analytics by and for the community.",
  "Explore and share data from Ethereum, Bitcoin, Polygon, BNB Chain, Solana, Arbitrum, Avalanche, Optimism, Fantom and Gnosis Chain for free.",
].join(" ");

export function truncateDescription(desc: string): string {
  if (desc.length > 200) {
    return `${desc.slice(0, 197)}...`;
  }
  return desc;
}
