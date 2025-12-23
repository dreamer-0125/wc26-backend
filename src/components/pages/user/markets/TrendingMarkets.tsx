import React, { useEffect, useState, useCallback, useMemo } from "react";
import useWebSocketStore from "@/stores/trade/ws";
import { debounce } from "lodash";
import Avatar from "@/components/elements/base/avatar/Avatar";
import LineChart from "./LineChart";
import Link from "next/link";
import { useRouter } from "next/router";
import $fetch from "@/utils/api";
import Marquee from "@/components/elements/base/marquee";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

interface MarketItem {
  symbol: string;
  currency: string;
  price: number;
  change: number;
  history: number[];
  type: "market";
}

interface MatchResult {
  id: string;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  time: string;
  date: Date;
  tournament: string;
  status: "upcoming" | "live" | "finished";
  type: "match";
}

type TrendingItem = MarketItem | MatchResult;

const generateFakeHistory = (initialPrice: number, length: number = 15) => {
  const history: number[] = [];
  let lastPrice = initialPrice;
  for (let i = 0; i < length; i++) {
    const variation = (Math.random() - 0.5) * 0.02;
    const price = lastPrice * (1 + variation);
    history.push(price);
    lastPrice = price;
  }
  return history;
};

// Map country names to country codes for flag display
const getCountryCode = (countryName: string): string => {
  const countryMap: Record<string, string> = {
    "Brazil": "BR",
    "Argentina": "AR",
    "France": "FR",
    "Germany": "DE",
    "Spain": "ES",
    "Italy": "IT",
    "England": "GB",
    "Portugal": "PT",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Uruguay": "UY",
    "Chile": "CL",
    "Colombia": "CO",
    "Mexico": "MX",
    "USA": "US",
    "United States": "US",
    "Canada": "CA",
    "Japan": "JP",
    "South Korea": "KR",
    "Australia": "AU",
    "Croatia": "HR",
    "Serbia": "RS",
    "Switzerland": "CH",
    "Poland": "PL",
    "Denmark": "DK",
    "Sweden": "SE",
    "Norway": "NO",
    "Russia": "RU",
    "Turkey": "TR",
    "Egypt": "EG",
    "Morocco": "MA",
    "Senegal": "SN",
    "Ghana": "GH",
    "Nigeria": "NG",
    "Cameroon": "CM",
    "Ivory Coast": "CI",
    "Algeria": "DZ",
    "Tunisia": "TN",
    "South Africa": "ZA",
    "China": "CN",
    "India": "IN",
    "Thailand": "TH",
    "Vietnam": "VN",
    "Indonesia": "ID",
    "Malaysia": "MY",
    "Singapore": "SG",
    "Philippines": "PH",
    "Saudi Arabia": "SA",
    "Iran": "IR",
    "Iraq": "IQ",
    "Qatar": "QA",
    "UAE": "AE",
    "United Arab Emirates": "AE",
  };
  
  return countryMap[countryName] || "XX"; // "XX" as fallback for unknown countries
};

// Example match data - replace with actual data from your API
const getUpcomingMatches = (): MatchResult[] => {
  const today = new Date();
  return [
    {
      id: "1",
      team1: "Brazil",
      team2: "Argentina",
      score1: undefined,
      score2: undefined,
      time: "20:00",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      tournament: "FIFA World Cup 2026",
      status: "upcoming",
      type: "match",
    },
    {
      id: "2",
      team1: "France",
      team2: "Germany",
      score1: undefined,
      score2: undefined,
      time: "18:00",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      tournament: "FIFA World Cup 2026",
      status: "upcoming",
      type: "match",
    },
    {
      id: "3",
      team1: "Spain",
      team2: "Italy",
      score1: 2,
      score2: 1,
      time: "21:00",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      tournament: "FIFA World Cup 2026",
      status: "finished",
      type: "match",
    },
    {
      id: "4",
      team1: "England",
      team2: "Portugal",
      score1: undefined,
      score2: undefined,
      time: "19:30",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      tournament: "FIFA World Cup 2026",
      status: "upcoming",
      type: "match",
    },
    {
      id: "5",
      team1: "Netherlands",
      team2: "Belgium",
      score1: 1,
      score2: 1,
      time: "17:00",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
      tournament: "FIFA World Cup 2026",
      status: "finished",
      type: "match",
    },
  ];
};

const TrendingMarkets = () => {
  const {
    createConnection,
    subscribe,
    unsubscribe,
    addMessageHandler,
    removeMessageHandler,
  } = useWebSocketStore();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [tickersFetched, setTickersFetched] = useState(false);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const maxItemsToShow = 10;

  useEffect(() => {
    setIsMounted(true);
    // Fetch match results
    const matches = getUpcomingMatches();
    setMatchResults(matches);
  }, []);

  const updateItem = useCallback(
    (existingItem: MarketItem, update: any): MarketItem => {
      const parseToNumber = (value: any) => {
        const parsedValue =
          typeof value === "number" ? value : parseFloat(value);
        return isNaN(parsedValue) ? 0 : parsedValue;
      };

      const newPrice =
        update?.last !== undefined
          ? parseToNumber(update.last)
          : existingItem.price;

      return {
        ...existingItem,
        price: newPrice,
        change:
          update?.change !== undefined
            ? parseToNumber(update.change)
            : existingItem.change,
        history: [...existingItem.history, newPrice].slice(-15),
      };
    },
    []
  );

  const updateItems = useCallback(
    (newData: any) => {
      setMarketItems((prevItems) => {
        const updatedItems = prevItems.map((item) => {
          const update = newData[item.symbol];
          return update ? updateItem(item, update) : updateItem(item, null);
        });

        const newMarkets = Object.keys(newData)
          .filter((key) => !prevItems.find((item) => item.symbol === key))
          .map((key) => ({
            symbol: key,
            currency: key.split("/")[0],
            price: newData[key].last,
            change: newData[key].change,
            history: generateFakeHistory(newData[key].last),
            type: "market" as const,
          }));

        return [...updatedItems, ...newMarkets].slice(0, maxItemsToShow);
      });
    },
    [updateItem]
  );

  const debouncedUpdateItems = useCallback(debounce(updateItems, 100), [
    updateItems,
  ]);

  const fetchTickers = useCallback(async () => {
    try {
    const { data, error } = await $fetch({
      url: "/api/exchange/ticker",
      silent: true,
    });

    if (error) {
        console.error("Error fetching tickers:", error);
        setTickersFetched(true);
      return;
    }

      if (data && typeof data === "object") {
        // Check if data has the expected structure
        const dataKeys = Object.keys(data);
        if (dataKeys.length > 0) {
          // Verify data structure - should have symbols as keys
          const firstKey = dataKeys[0];
          const firstValue = data[firstKey];
          
          // If data structure is correct (has last and change properties)
          if (firstValue && (firstValue.last !== undefined || firstValue.close !== undefined)) {
            // Normalize data structure - API might return 'close' instead of 'last'
            const normalizedData: any = {};
            Object.keys(data).forEach((symbol) => {
              const ticker = data[symbol];
              normalizedData[symbol] = {
                last: ticker.last || ticker.close || 0,
                change: ticker.change || ticker.percentage || 0,
              };
            });
            debouncedUpdateItems(normalizedData);
          } else {
            // Try direct assignment if structure is already correct
      debouncedUpdateItems(data);
          }
        } else {
          console.warn("No ticker data received from API");
        }
    }

    setTickersFetched(true);
    } catch (err) {
      console.error("Exception fetching tickers:", err);
      setTickersFetched(true);
    }
  }, [debouncedUpdateItems]);

  const debouncedFetchTickers = useCallback(debounce(fetchTickers, 100), [
    fetchTickers,
  ]);

  useEffect(() => {
    if (router.isReady) {
      debouncedFetchTickers();

      return () => {
        setTickersFetched(false);
      };
    }
  }, [router.isReady, debouncedFetchTickers]);

  useEffect(() => {
    if (tickersFetched) {
      createConnection("tickersConnection", "/api/exchange/ticker", {
        onOpen: () => {
          subscribe("tickersConnection", "tickers");
        },
      });

      return () => {
        unsubscribe("tickersConnection", "tickers");
      };
    }
  }, [tickersFetched, createConnection, subscribe, unsubscribe]);

  const handleTickerMessage = useCallback(
    (message: any) => {
      const { data } = message;
      if (!data) return;
      updateItems(data);
    },
    [updateItems]
  );

  const messageFilter = useCallback(
    (message: any) => message.stream && message.stream === "tickers",
    []
  );

  useEffect(() => {
    if (tickersFetched) {
      addMessageHandler(
        "tickersConnection",
        handleTickerMessage,
        messageFilter
      );

      return () => {
        removeMessageHandler("tickersConnection", handleTickerMessage);
      };
    }
  }, [
    tickersFetched,
    addMessageHandler,
    handleTickerMessage,
    messageFilter,
    removeMessageHandler,
  ]);

  const memoizedMarketItems = useMemo(
    () => marketItems.slice(0, maxItemsToShow),
    [marketItems]
  );

  // Combine market items and match results, interleaving them
  const combinedItems = useMemo(() => {
    const items: TrendingItem[] = [];
    const maxMatches = Math.min(5, matchResults.length);
    const maxMarkets = Math.min(maxItemsToShow, memoizedMarketItems.length);
    
    // If we have both markets and matches, interleave them
    // Otherwise, show what we have
    if (maxMarkets > 0 && maxMatches > 0) {
      // Interleave: market, match, market, match, etc.
      for (let i = 0; i < Math.max(maxMarkets, maxMatches); i++) {
        if (i < maxMarkets) {
          items.push(memoizedMarketItems[i]);
        }
        if (i < maxMatches) {
          items.push(matchResults[i]);
        }
      }
    } else {
      // Show markets first, then matches
      items.push(...memoizedMarketItems.slice(0, maxMarkets));
      items.push(...matchResults.slice(0, maxMatches));
    }
    
    return items;
  }, [memoizedMarketItems, matchResults]);

  if (!isMounted) {
    return null;
  }

  // Show loading only if we're still fetching and have no data at all
  if (!tickersFetched && marketItems.length === 0 && matchResults.length === 0) {
    return <div className="p-4 text-center text-muted-500">Loading market data...</div>;
  }

  // If we have no items to display, show a message
  if (combinedItems.length === 0) {
    return (
      <div className="p-4 text-center text-muted-500">
        No market data available at the moment. Please try again later.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden whitespace-nowrap">
      <Marquee speed={32} showGradients={true} direction="rtl">
        {combinedItems.map((item, i) => {
          if (item.type === "market") {
            const marketItem = item as MarketItem;
            return (
              <Link key={`market-${i}`} href={`/trade/${marketItem.symbol.replace("/", "_")}`}>
            <div
                  className="p-4 mx-2 border border-muted-200 dark:border-muted-800 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 bg-white dark:bg-muted-900 rounded-xl shadow-sm hover:shadow-md"
              style={{
                width: "300px",
                flexShrink: 0,
                marginRight: "16px",
              }}
            >
              <div className="flex items-center gap-4 pe-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar
                      size="xxs"
                          src={`/img/crypto/${marketItem.currency
                        .toLowerCase()
                        .replace("1000", "")}.webp`}
                    />
                    <span className="text-md text-muted-700 dark:text-muted-200">
                          {marketItem.symbol}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-muted-700 dark:text-muted-200 mb-2">
                        {marketItem.price !== undefined ? marketItem.price.toFixed(2) : "N/A"}
                  </div>
                  <div
                    className={`text-md font-semibold ${
                          marketItem.change >= 0 ? "text-success-500" : "text-danger-500"
                    } mb-4`}
                  >
                        {marketItem.change !== undefined ? marketItem.change.toFixed(2) : "N/A"}
                    %
                  </div>
                </div>
                <div className="w-40 h-20 py-1">
                      <LineChart width={150} height={80} values={marketItem.history} />
                </div>
              </div>
            </div>
          </Link>
            );
          } else {
            const matchItem = item as MatchResult;
            return (
              <Link key={`match-${i}`} href="/schedule">
                <div
                  className="p-4 mx-2 border border-primary-200 dark:border-primary-800 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl shadow-sm hover:shadow-md"
                  style={{
                    width: "300px",
                    flexShrink: 0,
                    marginRight: "16px",
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="mdi:soccer"
                        className="h-4 w-4 text-primary-500"
                      />
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        {matchItem.tournament}
                      </span>
                      {matchItem.status === "live" && (
                        <span className="ml-auto px-2 py-1 text-xs font-bold text-white bg-danger-500 rounded-full animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-muted-800 dark:text-muted-100 mb-1">
                          {matchItem.team1}
                        </div>
                        <div className="flex justify-center mb-1">
                          <img
                            src={`/img/flag/${getCountryCode(matchItem.team1)}.svg`}
                            alt={matchItem.team1}
                            className="w-6 h-4 object-cover rounded-sm shadow-sm"
                            onError={(e) => {
                              // Hide flag if image doesn't exist
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        {matchItem.status === "finished" && matchItem.score1 !== undefined && (
                          <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {matchItem.score1}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1 mx-2">
                        <span className="text-xs text-muted-500 dark:text-muted-400">
                          {matchItem.status === "finished" ? "FT" : matchItem.time}
                        </span>
                        {matchItem.status === "upcoming" && (
                          <span className="text-xs text-muted-400 dark:text-muted-500">
                            {format(matchItem.date, "MMM d")}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-sm font-semibold text-muted-800 dark:text-muted-100 mb-1">
                          {matchItem.team2}
                        </div>
                        <div className="flex justify-center mb-1">
                          <img
                            src={`/img/flag/${getCountryCode(matchItem.team2)}.svg`}
                            alt={matchItem.team2}
                            className="w-6 h-4 object-cover rounded-sm shadow-sm"
                            onError={(e) => {
                              // Hide flag if image doesn't exist
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        {matchItem.status === "finished" && matchItem.score2 !== undefined && (
                          <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {matchItem.score2}
                          </div>
                        )}
                      </div>
                    </div>
                    {matchItem.status === "upcoming" && (
                      <div className="text-center text-xs text-muted-500 dark:text-muted-400 pt-1 border-t border-primary-200 dark:border-primary-800">
                        vs
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          }
        })}
      </Marquee>
    </div>
  );
};

export default TrendingMarkets;
