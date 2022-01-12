import React, { useEffect, useState } from 'react';
import styled from 'styled-components'
import style from './NFT.module.scss';
import Media from 'components/base/Media';
import Scale from 'components/assets/scale';
import { computeCaps, computeTiime } from 'utils/strings';
import { UserType, NftType } from 'interfaces';
import ModalShare from 'components/base/ModalShare';
import NoNFTImage from '../../assets/NoNFTImage';
import Details from './Details';
import Avatar from 'components/base/Avatar';
import { MARKETPLACE_ID } from 'utils/constant';
import { Container, Title, Wrapper } from 'components/layout';
import Button from 'components/ui/Button';
import Chip from 'components/ui/Chip';
import Showcase from 'components/base/Showcase';
import { getByTheSameArtistNFTs, getOwnedNFTS, getSeriesData } from 'actions/nft';
import { getRandomNFTFromArray } from 'utils/functions';
import { toggleLike } from 'utils/profile';
import { LIKE_ACTION, UNLIKE_ACTION } from 'utils/profile/constants';

export interface NFTPageProps {
  NFT: NftType;
  setNftToBuy: (NFT: NftType) => void;
  user: UserType;
  type: string | null;
  setExp: (n: number) => void;
  capsValue: number;
  isUserFromDappQR: boolean;
}

const NFTPage = ({
  setExp,
  NFT,
  setNftToBuy,
  user,
  type,
  isUserFromDappQR,
}: NFTPageProps) => {
  const [isLiked, setIsLiked] = useState(
    (NFT.serieId === '0'
      ? user?.likedNFTs?.some(({ nftId }) => nftId === NFT.id)
      : user?.likedNFTs?.some(({ serieId }) => serieId === NFT.serieId)) ?? false
  );
  const [likeLoading, setLikeLoading] = useState(false);
  const [modalShareOpen, setModalShareOpen] = useState(false);
  const [byTheSameArtistNFTs, setByTheSameArtistNFTs] = useState<NftType[]>([])
  const [canUserBuyAgain, setCanUserBuyAgain] = useState(true)
  const [seriesData, setSeriesData] = useState([NFT])
  const isVR = (NFT.categories.findIndex(x => x.code === "vr") !== -1) && NFT.creator === NFT.owner
  const shareSubject = 'Check out this Secret NFT';
  const shareText = `Check out ${NFT.title ? NFT.title : 'this nft'} on ${
    process.env.NEXT_PUBLIC_APP_LINK
      ? process.env.NEXT_PUBLIC_APP_LINK
      : 'secret-nft.com'
  }`;
  const shareUrl =
    (typeof window !== 'undefined' && window.location?.href) ||
    `https://www.${
      process.env.NEXT_PUBLIC_APP_LINK
        ? process.env.NEXT_PUBLIC_APP_LINK
        : 'secret-nft.com'
    }/nft/${NFT.id}`;
  const smallestPriceRow =
    seriesData
      .filter((x) => x.marketplaceId === MARKETPLACE_ID)
      .sort(
        (a, b) =>
          (a.owner === b.owner
            ? 0
            : !user
            ? 0
            : a.owner === user.walletId
            ? 1
            : b.owner === user.walletId
            ? -1
            : 0) || // take nft which i'm not owner first
          b.listed - a.listed || //listed first
          Number(a.price) - Number(b.price) || //lowest price first
          Number(a.priceTiime) - Number(b.priceTiime) // lower pricetiime first
      )[0];
  const userCanBuy = (!isVR || (isVR && isUserFromDappQR && canUserBuyAgain)) && (user
    ? user.capsAmount &&
      smallestPriceRow &&
      smallestPriceRow.listed &&
      smallestPriceRow.price &&
      smallestPriceRow.price !== '' &&
      Number(user.capsAmount) >= Number(smallestPriceRow.price) &&
      user.walletId !== smallestPriceRow.owner &&
      smallestPriceRow.marketplaceId === MARKETPLACE_ID
    : smallestPriceRow
    ? smallestPriceRow.listed === 1 &&
      smallestPriceRow.marketplaceId === MARKETPLACE_ID
    : false);

  useEffect(() => {
    loadSeriesData(NFT.serieId);
  }, []);
  
  useEffect(() => {
    setNftToBuy(smallestPriceRow);
  }, [smallestPriceRow]);

  useEffect(() => {
    loadByTheSameArtistNFTs()
  }, [NFT])

  useEffect(() => {
    if (isVR && user){
      loadCanUserBuyAgain()
    }else{
      setCanUserBuyAgain(true)
    }
  }, [isVR])

  const loadSeriesData = async (seriesId: string) => {
    try{
      const result = await getSeriesData(seriesId)
      setSeriesData(result.data)
    }catch(err){
      console.log(err)
    }
  }

  const loadCanUserBuyAgain = async () => {
    try{
      const res = await getOwnedNFTS(user.walletId,false, undefined, undefined, undefined, seriesData?.map(x => x.id))
      const canUserBuyAgainValue = res.totalCount === 0
      setCanUserBuyAgain(canUserBuyAgainValue)
      return canUserBuyAgainValue
    }catch(err){
      setCanUserBuyAgain(false)
      return false
    }
  }

  const loadByTheSameArtistNFTs = async () => {
    const NFTs = await getByTheSameArtistNFTs(NFT.creator, "1", "7")
    setByTheSameArtistNFTs(NFTs.data.filter(x => x.serieId !== NFT.serieId))
  }

  const toggleLikeDislike = async () => {
    try {
      if (!likeLoading && user?.walletId) {
        setLikeLoading(true);
        await toggleLike(NFT, isLiked ? UNLIKE_ACTION : LIKE_ACTION, user.walletId, setIsLiked);
        setLikeLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (window && window.isRNApp &&  window.navigator && window.navigator.share){
        await window.navigator.share({
          title: shareSubject,
          text: shareText,
          url: shareUrl
        })
      }else{
        setModalShareOpen(true)
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuy = async () => {
    //get a random row to buy if same price
    const smallestPriceRows = seriesData
        .filter((x) => x.marketplaceId === MARKETPLACE_ID && x.listed===1 && (!user || (x.owner !== user.walletId)))
        .sort(
          (a, b) =>
            Number(a.price) - Number(b.price) || //lowest price first
            Number(a.priceTiime) - Number(b.priceTiime) // lower pricetiime first
        ).filter((x, _i, arr) => 
          x.price === arr[0].price &&
          x.priceTiime === arr[0].priceTiime
        )
    let canBuyAgain = true
    if (isVR){
      canBuyAgain = await loadCanUserBuyAgain()
    }
    if (canBuyAgain){
      setNftToBuy(getRandomNFTFromArray(smallestPriceRows));
      setExp(2);
    }
  };

  const smallestCapsPrice = Number(smallestPriceRow?.price);
  const smallestTiimePrice = Number(smallestPriceRow?.priceTiime);
  const isSmallestCapsPrice = smallestCapsPrice > 0;
  const isSmallestTiimePrice = smallestTiimePrice > 0;

  const smallestPriceWording =
    isSmallestCapsPrice || isSmallestTiimePrice
      ? `${isSmallestCapsPrice ? `${computeCaps(smallestCapsPrice)} CAPS` : ''}
          ${isSmallestCapsPrice && isSmallestTiimePrice ? ' / ' : ''}
          ${isSmallestTiimePrice ? `${computeTiime(smallestTiimePrice)} TIIME` : ''}`
      : undefined;

  const ctaWording =
    isVR && !isUserFromDappQR
      ? 'Reserved for VR gallery'
      : !canUserBuyAgain
      ? '1 VR NFT per account'
      : smallestPriceWording && `Buy for ${smallestPriceWording}`;

  return (
    <Container>
      <Wrapper>
        <SNftWrapper>
          <SMediaWrapper className={style.NFT}>
            <Media src={NFT.properties?.preview.ipfs!} type={type} alt="imgnft" draggable="false" />
            <div onClick={() => setExp(1)} className={style.Scale}>
              <Scale className={style.ScaleSVG} />
            </div>
          </SMediaWrapper>
          <div className={style.Text}>
            <div className={style.Top}>
              <Avatar
                isVerified={NFT.creatorData?.verified}
                name={NFT.creatorData?.name}
                picture={NFT.creatorData?.picture}
                twitterName={NFT.creatorData?.twitterName}
                walletId={NFT.creatorData?.walletId}
              />
              <STopCtasContainer>
                <Chip color="invertedContrast" icon="eye" size="medium" text={NFT.viewsCount} variant="rectangle" />
                <Button color="neutral200" disabled={likeLoading} icon="heart" isLoading={likeLoading} onClick={toggleLikeDislike} size="small" variant="outlined" />
                <Button color="neutral200" icon="share" onClick={handleShare} size="small" variant="outlined" />
              </STopCtasContainer>
            </div>
            <div className={style.Line} />
            <Title>
              {NFT.title}
              {NFT.isCapsule && (
                <SChip
                  color="primaryLight"
                  text={
                    <>
                      <SDot />
                      Capsule
                    </>
                  }
                  variant="rectangle"
                />
              )}
            </Title>
            <SCategoriesWrapper>
              {NFT.categories.map(({ name, code }) => (
                <Chip key={code} color="invertedContrast" text={name} size="medium" variant="rectangle" />
              ))}
            </SCategoriesWrapper>
            <p className={style.Description}>{NFT.description}</p>
            <Button color="primary" disabled={!userCanBuy} onClick={handleBuy} size="medium" text={ctaWording} variant="contained"/>
            <div className={style.Available}>
              <div className={style.AvailbleText}>
                <NoNFTImage className={style.AvailbleCards} />
                <div className={style.AvailableTextContent}>
                  {`${NFT.totalListedInMarketplace ?? 0} of ${NFT.totalNft ?? 0}`} Available
                </div>
              </div>
              <div className={style.AvailableBackLine} />
            </div>
          </div>
        </SNftWrapper>
        <Details
          NFT={NFT}
          seriesData={seriesData}
          user={user}
          setNftToBuy={setNftToBuy}
          setExp={setExp}
          isUserFromDappQR={isUserFromDappQR}
          isVR={isVR}
          canUserBuyAgain={canUserBuyAgain}
        />
      </Wrapper>
      {byTheSameArtistNFTs.length > 0 && (
        <Wrapper>
          <Showcase category="By the same artist" NFTs={byTheSameArtistNFTs} user={user} />
        </Wrapper>
      )}
      {modalShareOpen && (
        <ModalShare
          setModalExpand={setModalShareOpen}
          title={'Share this NFT with your friends'}
          subject={shareSubject}
          text={shareText}
          url={shareUrl}
        />
      )}
    </Container>
  );
};

const SNftWrapper = styled(Wrapper)`
  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: row;
    justify-content: space-evenly;
    padding: 3.2rem 6.4rem;
  }
`;

const SMediaWrapper = styled.div`
  height: ${({theme}) => theme.sizes.cardHeight.md};
  width: ${({theme}) => theme.sizes.cardWidth.md};

  ${({ theme }) => theme.mediaQueries.xxl} {
    height: ${({theme}) => theme.sizes.cardHeight.lg};
    width: ${({theme}) => theme.sizes.cardWidth.lg};
  }
`;

const STopCtasContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2.4rem;

  ${({ theme }) => theme.mediaQueries.md} {
    margin: 0;
  }

  > * {
    &:not(:first-child) {
      margin-left: 1.6rem;
    };
  }
`;

const SChip = styled(Chip)`
  margin: 1.6rem auto 0;

  ${({ theme }) => theme.mediaQueries.md} {
    margin: 0;
    transform: translateY(85%);
  }
`

const SDot = styled.div`
  width: 0.8rem;
  height: 0.8rem;
  background: ${({theme}) => theme.colors.primary};
  border-radius: 50%;
`

const SCategoriesWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.6rem;
  margin-top: 1.6rem;


  ${({ theme }) => theme.mediaQueries.md} {
    justify-content: start;
    margin: 0;
  }
`

export default NFTPage;
