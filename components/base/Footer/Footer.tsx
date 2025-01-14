import React from 'react';
import  styled from 'styled-components';

import Icon from 'components/ui/Icon';

import style from './Footer.module.scss';

const Footer = () => {
  const twitterLink = process.env.NEXT_PUBLIC_TWITTER_LINK ? process.env.NEXT_PUBLIC_TWITTER_LINK : "https://twitter.com/SecretNFT_"
  const instagramLink = process.env.NEXT_PUBLIC_INSTAGRAM_LINK ? process.env.NEXT_PUBLIC_INSTAGRAM_LINK : "https://www.instagram.com/ternoa_/"
  return (
    <div className={style.Footer}>
      <SIcon name="waterMark" />
      <SSocialsContainer>
        {twitterLink!=="false" && <a href={twitterLink} target="_blank">
          <SMediaIcon name="socialTwitter" />
        </a>}
        {instagramLink!=="false" && <a href={instagramLink} target="_blank">
          <SMediaIcon name="socialInstagram" />
        </a>}
      </SSocialsContainer>
      <div className={style.FooterBar}>
        <div className={style.Legals}>
          <div className={style.Link}>{process.env.NEXT_PUBLIC_APP_NAME || "SecretNFT"}</div>
          <div className={style.Link}>All rights reserved</div>
          <a
            href="https://ternoahelp.zendesk.com/hc/fr/articles/4409410791185-Terms-of-use"
            className={style.Link}
            target="_blank"
						rel="noreferrer noopener"
          >
            Terms
          </a>
          <a
            href="https://ternoahelp.zendesk.com/hc/fr/articles/4409410776337-Privacy-Policy"
            className={style.Link}
            target="_blank"
						rel="noreferrer noopener"
          >
            Privacy
          </a>
        </div>
        {/* <div className={style.Languages}></div> */}
      </div>
    </div>
  );
};

const SSocialsContainer = styled.div`
  width: 100%;
  display: flex;
  margin: 9rem 0 3.2rem;
  align-items: center;
  justify-content: center;
  z-index: 2;

  > a {
    &:not(:first-child) {
      margin-left: 3.2rem;
    }
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    margin: 9rem 0 8rem;
  }
`;

const SIcon = styled(Icon)`
  width: 16rem;
  position: absolute;
  left: 25%;
  top: 2rem;
  z-index: 1;

  ${({ theme }) => theme.mediaQueries.lg} {
    width: 11.2rem;
  }
`;

const SMediaIcon = styled(Icon)`
  width: 1.6rem;
  cursor: pointer;
  fill: white;
  z-index: 10;

  ${({ theme }) => theme.mediaQueries.lg} {
    width: 2.4rem;
  }
`;

export default Footer;
