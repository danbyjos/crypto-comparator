import React, { useState, useEffect } from "react";
import "../styles/StylingFile.css";
import Constants from "../utils/Constants";
import { fetchGetRequest } from "../service/service";
import Table from "./common/ReactTable";
import SummaryPage from "./Summary";
import CurrencyFormat from "react-currency-format";


const LandingPage = (props) => {

    const [isError, setIsError] = useState(false);
    const [showLanding, setShowLanding] = useState(true);
    const [showTable, setShowTable] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [status, setStatus] = useState('init');
    const [cryptoList, setCryptoList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const NullComponent = () => null;

    useEffect(() => {
        if (isError) throw new Error("Error in the Crypto Service Call");
    }, [isError]);

    const loadAllAssets = () =>{
        fetchGetRequest(Constants.getAllCryptoURL).then(results => {
            if (results !== undefined && results !== null && results === "error") {
                setIsError(true);
            } else if (results !== undefined && results !== null) {
                mapColumnToJson(results);
                setShowTable(true);
            } else {
                setStatus("noResults");
                setShowTable(false);
            }
        });
    }

    function refreshApplication() {
        window.location.reload(false);
     };

    const returnToLanding = () =>{
      setShowLanding(true);
      setShowTable(true);
      setShowSummary(false);
    }
    
    const displaySummaryPage = () => {
      setShowLanding(false);
      setShowTable(false);
      setShowSummary(true);
    };

    const mapColumnToJson = (results) => {

        const list = [];
        results.map((resp) => {
            const cryptoRow = {
                Symbol : "N/A",
                Name : "N/A",
                Image : "N/A",
                CurrentPrice : "N/A",
                MarketCap : "N/A",
                MarketCapRank : "N/A",
                High24hr : "N/A",
                Low24hr : "N/A",
                CirculatingSupply : "N/A",
                TotalSupply : "N/A"
              }

            //map data
            if (resp.symbol !== undefined && resp.symbol !== null) { cryptoRow["Symbol"] = resp.symbol; }
            if (resp.name !== undefined && resp.name !== null) { cryptoRow["Name"] = resp.name; }
            if (resp.image !== undefined && resp.image !== null) { cryptoRow["Image"] =  resp.image; }
            if (resp.current_price !== undefined && resp.current_price !== null) { cryptoRow["CurrentPrice"] = resp.current_price; }

            if (resp.market_cap !== undefined && resp.market_cap !== null) { cryptoRow["MarketCap"] =  resp.market_cap; }
            if (resp.market_cap_rank !== undefined && resp.market_cap_rank !== null) { cryptoRow["MarketCapRank"] =  resp.market_cap_rank; }
            if (resp.high_24h !== undefined && resp.high_24h !== null) { cryptoRow["High24hr"] =  resp.high_24h; }
            if (resp.low_24h !== undefined && resp.low_24h !== null) { cryptoRow["Low24hr"] =  resp.low_24h; }
            if (resp.circulating_supply !== undefined && resp.circulating_supply !== null) { cryptoRow["CirculatingSupply"] =  resp.circulating_supply; }
            if (resp.total_supply !== undefined && resp.total_supply !== null) { cryptoRow["TotalSupply"] =  resp.total_supply; }

            list.push(cryptoRow);
        })
        setCryptoList(list);
    }

    const tableColumns= React.useMemo( () => [
            {
              Header: "Logo",
              accessor: "Image",
              Cell: tableProps => (
                <div><img src={tableProps.row.original.Image} height={36}/></div>
              )
            },
            {
              Header: "Symbol",
              accessor: "Symbol"
            },
            {
              Header: "Name",
              accessor: "Name",
              Cell: tableProps => (
                <div><b>{tableProps.row.original.Name}</b></div>
              )
            },
            {
              Header: "Current Price",
              accessor: "CurrentPrice",
              Cell: tableProps => (
                <CurrencyFormat
                    value={tableProps.row.original.CurrentPrice} displayType={"text"}
                    thousandSeparator={true} prefix={"$"} decimalScale={tableProps.row.original.CurrentPrice > 0.01 ? 2 : 10} fixedDecimalScale={true}
                />
              )
            },
            {
              Header: "Market Cap",
              accessor: "MarketCap",
              Cell: tableProps => (
                <CurrencyFormat
                    value={tableProps.row.original.MarketCap} displayType={"text"}
                    thousandSeparator={true} prefix={"$"}
                />
              )
            },
            {
              Header: "Market Cap Rank",
              accessor: "MarketCapRank"
            },
            {
              Header: "24hr High",
              accessor: "High24hr",
              Cell: tableProps => (
                <CurrencyFormat
                    value={tableProps.row.original.High24hr} displayType={"text"}
                    thousandSeparator={true} prefix={"$"} decimalScale={2} fixedDecimalScale={true}
                />
              )
            },
            {
              Header: "24hr Low",
              accessor: "Low24hr",
              Cell: tableProps => (
                <CurrencyFormat
                    value={tableProps.row.original.Low24hr} displayType={"text"}
                    thousandSeparator={true} prefix={"$"} decimalScale={2} fixedDecimalScale={true}
                />
              )
            },
            {
              Header: "Circulating Supply",
              accessor: "CirculatingSupply",
              Cell: tableProps => (
                (tableProps.row.original.CirculatingSupply !="N/A" ?
                <CurrencyFormat
                    value={tableProps.row.original.CirculatingSupply} displayType={"text"}
                    thousandSeparator={true} prefix={"$"} decimalScale={0}
                />: tableProps.row.original.CirculatingSupply)
              )
            },
            {
              Header: "Total Supply",
              accessor: "TotalSupply",
              Cell: tableProps => (
                (tableProps.row.original.TotalSupply !="N/A" ?
                <CurrencyFormat
                    value={tableProps.row.original.TotalSupply} displayType={"text"}
                    thousandSeparator={true} prefix={"$"} 
                />: tableProps.row.original.TotalSupply)
              )
            }
        ],
        []
      );

    return (
        <div className="container body-content">
          <div class="row padding-top-tinier inner-float-left">
            <div class="col-lg-2"/>
            <div class="col-lg-2 inner-float-right">
              <button class="crypto_button" onClick={(e) => refreshApplication()}>RETURN TO HOME</button>
            </div>
            {(showSummary) ? <div class="col-lg-2">
              <button class="crypto_button" onClick={(e) => returnToLanding()}> {"< PREVIOUS PAGE"}</button>
            </div> : <div></div> }
            <div class="col-lg-2"/>
          </div>
            {(showLanding) ?
            <div className="center">
                <div className="row margin-top-tiniest margin-bottom-tiniest text-large bold padding-top-tinier">
                    Load crypto assets by clicking the button below
                </div>
                <div class="row padding-top-tiny">  
                    <div class="inner-center">
                        <button class="crypto_button" onClick={(e) => loadAllAssets()}>LOAD ALL CRYPTO ASSETS</button>
                    </div>
                </div>
                {(showTable) ?
                <div>
                    <div class="padding-top-smallest text-medium-xx"><b>Select up to 3 assets from the table below and click "Compare" to view results.</b></div>
                    <div class="row padding-top-tinier padding-left-large padding-right-large">
                        <Table columns={tableColumns} data={cryptoList} setSelectedRows={setSelectedRows}/>
                    </div>
                    <div class="row padding-bottom-large">
                      <div class="col-lg-8"/>
                      <div class="col-lg-2 inner-float-right">
                          <button class="crypto_button padding-right-medium padding-left-medium" 
                            disabled={selectedRows.length < 2}
                            onClick={(e) => displaySummaryPage()}>COMPARE</button>
                      </div>
                      <div class="col-lg-2"/>
                    </div>
                </div>
                : <div></div>
                }
            </div> : <div></div>
            }
            {(showSummary) ? <div class="center"><SummaryPage selectedRows={selectedRows}/></div> 
                  : <div></div>
            }
        </div>
        );
};

export default LandingPage;
