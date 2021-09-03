import React, { Fragment, useReducer, useEffect } from 'react';

// styled-componentsの定義
import styled from 'styled-components';

// React Routerにおけるリンク
import { Link } from "react-router-dom";

// components
import Skeleton from '@material-ui/lab/Skeleton';

// apis
import { fetchRestaurants } from '../apis/restaurants';

// reducers
import {
  initialState,
  restaurantsActionTyps,
  restaurantsReducer,
} from '../reducers/restaurants';

// constants
import { REQUEST_STATE } from '../constants';

// images
import MainLogo from '../images/logo.png';
import MainCoverImage from '../images/main-cover-image.png';
import RestaurantImage from '../images/restaurant-image.jpg';

// ヘッダー全体に対してスタイルを定義
const HeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  padding: 8px 32px;
`;

// ヘッダーロゴに対してスタイルを当てている
const MainLogoImage = styled.img`
  height: 90px;
`
// トップページのメイン画像にスタイルを当てている
const MainCoverImageWrapper = styled.div`
  text-align: center;
`;

const MainCover = styled.img`
  height: 600px;
`;

const RestaurantsContentsList = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 150px;
`;

const RestaurantsContentWrapper = styled.div`
  width: 450px;
  height: 300px;
  padding: 48px;
`;

const RestaurantsImageNode = styled.img`
  width: 100%;
`;

const MainText = styled.p`
  color: black;
  font-size: 18px;
`;

const SubText = styled.p`
  color: black;
  font-size: 12px;
`;

export const Restaurants = () => {
  // useReducerの初期化
  const [state, dispatch] = useReducer(restaurantsReducer, initialState);

  // 副作用（fetchメソッドによる非同期通信）の設定
  useEffect(() => {
    // reducerのアクションタイプを通信中(fetching)で指定
    dispatch({ type: restaurantsActionTyps.FETCHING });
    // 非同期通信の開始
    fetchRestaurants()
    .then((data) =>
      dispatch({
        // reducerのアクションタイプを通信成功(fetch success)で指定
        // これらのデータはstateに入るため、state.restaurantsListやstate.fetchStateのようなかたちで参照することができます
        type: restaurantsActionTyps.FETCH_SUCCESS,
        payload: {
          restaurants: data.restaurants
        }
      })
    )
  }, [])

  return (
    <Fragment>
      <HeaderWrapper>
        <MainLogoImage src={MainLogo} alt="main logo" />
      </HeaderWrapper>
      <MainCoverImageWrapper>
        <MainCover src={MainCoverImage} alt="main cover" />
      </MainCoverImageWrapper>
      <RestaurantsContentsList>
        {
          // 三項演算子
          state.fetchState === REQUEST_STATE.LOADING ?
            // ローディング中だったら・・・
            <Fragment>
              <Skeleton variant="rect" width={450} height={300} />
              <Skeleton variant="rect" width={450} height={300} />
              <Skeleton variant="rect" width={450} height={300} />
            </Fragment>
          :
            // ロードが完了したら
            state.restaurantsList.map((item, index) =>
              <Link to={`/restaurants/${item.id}/foods`} key={index} style={{ textDecoration: 'none' }}>
                <RestaurantsContentWrapper>
                  <RestaurantsImageNode src={RestaurantImage} />
                  <MainText>{item.name}</MainText>
                  <SubText>{`配送料：${item.fee}円 ${item.time_required}分`}</SubText>
                </RestaurantsContentWrapper>
              </Link>
            )
        }
      </RestaurantsContentsList>
    </Fragment>
  )
}