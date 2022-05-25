import React, { useState, useEffect } from "react";
import Constants from "../utils/Constants";
import { fetchGetRequest } from "../service/service";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from "recharts";
import CurrencyFormat from "react-currency-format";
import recommended from '../images/recommended.png';
import notrecommended from '../images/notrecommended.png';
import ProgressBar from "../utils/ProgressBar";

const Summary = (props) => {

    const [isError, setIsError] = useState(false);
    const [status, setStatus] = useState('init');
    const [loading, setLoading] = useState(true);
    const [allAssets, setAllAssets] = useState([{}]);
    const [globalError, setGlobalError] = useState('none');
    const [recommendedInvestment, setRecommendedInvestment] = useState();
    
    useEffect(() => {
        loadSelectedAssets();     
    },[]);

    const loadSelectedAssets = () =>{
        setLoading(true);
        let detailsURL = Constants.getSelectedCryptoDetailsURL;
        const selectedMap = new Map();

        props.selectedRows.map((selectedCrypto) => {
            detailsURL += selectedCrypto.Symbol.toUpperCase() + ",";
            selectedMap.set(selectedCrypto.Symbol.toUpperCase(), selectedCrypto.Name);
        });

        fetchGetRequest(detailsURL).then(results => {
            if (results !== undefined && results !== null && results === "error") {
                setIsError(true);
                setGlobalError("Service Unavailable. Please try again later");
            } else if (results !== undefined && results !== null) {
                if(results.data !== undefined && results.data !== null && results.data.length > 0){
                    mapColumnToJson(results.data, selectedMap);
                }else{
                    setIsError(true);
                    setGlobalError("No details found for selected Assets - please make another selection");
                }
            } else {
                setStatus("noResults");
            }
            setLoading(false);
        });
    }

    const mapColumnToJson = (data, selectedMap) => {
        
        let assets = [];
        data.map((asset,index) => {

            let assetObject = {
                "name":asset.name,
                "timeData":[],
                "price": asset.price,
                "market_cap_rank": asset.market_cap_rank,
                "market_cap": asset.market_cap,
                "market_dominance": asset.market_dominance > 0.01 ? (Math.round(asset.market_dominance * 100) / 100).toFixed(2) : asset.market_dominance,
                "volume": asset.volume > 0.01 ? (Math.round(asset.volume * 100) / 100).toFixed(2) : asset.volume,
                "percent_change_24h": asset.percent_change_24h,
                "percent_change_7d": asset.percent_change_7d,
                "percent_change_30d": asset.percent_change_30d,
                "tweets": asset.tweets === undefined ? "0" : asset.tweets,
                "tweet_retweets": asset.tweet_retweets === undefined ? "0" : asset.tweet_retweets,
                "social_volume": asset.social_volume === undefined ? "0" : asset.social_volume,
                "social_contributors": asset.social_contributors === undefined ? "0" : asset.social_contributors,
                "news": asset.news === undefined ? "0" : asset.news
            }

            if(asset.timeSeries !== undefined && asset.timeSeries !== null){
                //get hourly price data
                var hourlyData = asset.timeSeries;  
                hourlyData.map((hourDetails) => {
                    //get data and create arrays
                    if(asset.name !== undefined && asset.name !== null &&
                        hourDetails.time !== undefined && hourDetails.time !== null &&
                         hourDetails.close !== undefined && hourDetails.close !== null ){
                        
                        //create utility helper function
                        var utcSeconds = hourDetails.time;
                        var date = new Date(0); 
                        date.setUTCSeconds(utcSeconds);

                        const timeAmPm = date.toLocaleTimeString('en-US', {
                            // en-US can be set to 'default' to use user's browser settings
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        var finalTime  = (timeAmPm.replace(/^0+/, '')).replace(/\s/g, "");

                        const cryptoTimeDataRow = {
                            time : "1h",
                            price : "N/A"
                        }
                        cryptoTimeDataRow["time"] = finalTime;
                        cryptoTimeDataRow["price"] = hourDetails.close;
                        //set time data
                        assetObject.timeData.push(cryptoTimeDataRow);
                    }
                })
                //add asset to array
                assets.push(assetObject);
            }
        })

        //check if user asked for details of more assets but were not returned
        if(data.length!==selectedMap.size){
            selectedMap.forEach(function(value,key) {
                if(!data.some(item => item.symbol === key)){
                    //service did not return details for this asset, create empty object
                    let assetObject = {
                        "name":value,
                        "timeData":[]
                    }
                    assets.push(assetObject);
                }

            });
        }
        setAllAssets(assets);
        calculateInvestment(assets);
    }

    const calculateInvestment = (assets) => {
    
        const scoreMap = new Map();
        var assetsCopy = assets.slice();

        assets.map((asset) => {
            let score = 0;
            assetsCopy.map((asset2) => {
                if(asset.name !== asset2.name){
                    let index = positiveIndex(asset,asset2);
                    //combined score against all assets selected
                    score += index;
                }
            });
            scoreMap.set(asset.name,score);
        });

        let highestScore = Math.max(...scoreMap.values());
        scoreMap.forEach(function(value,key){
            if(value===highestScore){
                setRecommendedInvestment(key);
            }
        })

    }

    const positiveIndex = (asset, asset2) => {
        let favorableIndex = 0;
        //2 points for important statistical factors
        if(parseFloat(asset.market_cap) > parseFloat(asset2.market_cap)) favorableIndex=favorableIndex+2;
        if(parseFloat(asset.volume) > parseFloat(asset2.volume)) favorableIndex=favorableIndex+2;
        if(parseFloat(asset.market_dominance) > parseFloat(asset2.market_dominance)) favorableIndex=favorableIndex+2;
        //1.5 point for performance in last 7 and 30 days
        if(parseFloat(asset.percent_change_7d) > parseFloat(asset2.percent_change_7d)) favorableIndex=favorableIndex+1.5;
        if(parseFloat(asset.percent_change_30d) > parseFloat(asset2.percent_change_30d)) favorableIndex=favorableIndex+1.5;
        //1 point for social media activity
        if(parseFloat(asset.tweets) > parseFloat(asset2.tweets)) favorableIndex++;
        if(parseFloat(asset.tweet_retweets) > parseFloat(asset2.tweet_retweets)) favorableIndex++;
        if(parseFloat(asset.social_volume) > parseFloat(asset2.social_volume)) favorableIndex++;
        if(parseFloat(asset.social_contributors) > parseFloat(asset2.social_contributors)) favorableIndex++;
        if(parseFloat(asset.news) > parseFloat(asset2.news)) favorableIndex++;
        
        return favorableIndex;
    }

    const DisplayAsset = (data) => {
    
     return (
        <div class={data.size===2 ? "col-lg-6 text-medium-xx" : "col-lg-4 text-medium-xx"}>
            <div>
                <div>
                    <div class="padding-bottom-tiniest center">Asset: <b>{data.asset.name}</b></div>
                    <div class="padding-bottom-tinier inner-center"><LineChart
                        width={460}
                        height={220}
                        data={data.asset.timeData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5
                        }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis dataKey="price" type="number" domain={['auto', 'auto']} />
                        <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(value)} />
                        <Legend />
                        <Line type="monotone" name="$ Price - Last 24hrs" dataKey="price" stroke="#8884d8" />
                    </LineChart></div>
                </div>
                {data.asset.timeData.length > 0 ? 
                <div>
                    <div class="padding-bottom-tiniest center">Current Price: <b>
                    <CurrencyFormat
                        value={data.asset.price} displayType={"text"} thousandSeparator={true} prefix={"$"} 
                        decimalScale={data.asset.price > 0.01 ? 2 : 10} fixedDecimalScale={true}/></b>
                    </div>
                    <div class="padding-bottom-tiniest center">Market Cap: <b>
                        <CurrencyFormat value={data.asset.market_cap} displayType={"text"} thousandSeparator={true} prefix={"$"}/></b>
                    </div>
                    <div class="padding-bottom-tiniest center">Market Cap Rank: <b>{data.asset.market_cap_rank}</b></div>
                    <div class="padding-bottom-tiniest center">Market Dominance: <b>{data.asset.market_dominance}</b>%</div>
                    <div class="padding-bottom-tiniest center">Trading volume: <b>
                        <CurrencyFormat value={data.asset.volume} displayType={"text"} thousandSeparator={true}/></b>
                    </div>

                    <div class="padding-bottom-tiniest center">Percentage Change Last 24h: <b>{data.asset.percent_change_24h}</b>%</div>
                    <div class="padding-bottom-tiniest center">Percentage Change Last 7 days: <b>{data.asset.percent_change_7d}</b>%</div>
                    <div class="padding-bottom-tiniest center">Percentage Change Last 30 days: <b>{data.asset.percent_change_30d}</b>%</div>
                    <div class="padding-bottom-tiniest center">Number of tweets: <b>{data.asset.tweets}</b></div>
                    <div class="padding-bottom-tiniest center">Number of retweets: <b>{data.asset.tweet_retweets}</b></div>
                    <div class="padding-bottom-tiniest center">Social Volume: <b>{data.asset.social_volume}</b></div>
                    <div class="padding-bottom-tiniest center">Social contributors: <b>{data.asset.social_contributors}</b></div>
                    <div class="padding-bottom-tiniest center">News: <b>{data.asset.news}</b></div>
                    
                    <div class="padding-bottom-tiniest padding-top-tiny center">
                        {recommendedInvestment ===  data.asset.name ?
                            <div><div class="padding-bottom-tiniest"><b>This asset is recommended for an investment!</b></div><div><img src={recommended}/></div></div>
                            : <div><div class="padding-bottom-tiniest"><b>This asset is NOT recommended for an investment.</b></div><div><img src={notrecommended}/></div></div>
                        }
                    </div>
                </div> : <div class="padding-bottom-tiniest center error_notfound"><b>No details found for this asset</b></div>
                }
            </div>
        </div>
        );
    };


    return <div class="padding-top-small">
            <div class="padding-bottom-tiny text-huge">
                <b>SUMMARY PAGE</b>
            </div>
            {loading ? <div class="col-lg-12"> <ProgressBar/></div> : isError === true ? <div class="error_notfound">{globalError}</div> : 
            <div>
            <div class="padding-bottom-tiny"><u>Performance of selected Assets</u></div>
            {allAssets.map(asset => 
                <DisplayAsset asset={asset} size={allAssets.length}/>
            )}
            </div>
            }
        </div>
};

export default Summary;