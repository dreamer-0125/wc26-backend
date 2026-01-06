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
    "Costa Rica": "CR",
    "Ecuador": "EC",
    "Paraguay": "PY",
    "New Zealand": "NZ",
  };
  
  return countryMap[countryName] || "XX"; // "XX" as fallback for unknown countries
};

// FIFA 2026 World Cup Schedule - Get upcoming matches
const getUpcomingMatches = (): MatchResult[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

  // FIFA 2026 World Cup Schedule - All matches
  const fifa2026Matches = [
    // Group Stage - June 11-27, 2026
    { date: new Date(2026, 5, 11), team1: "Mexico", team2: "Canada", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Mexico City" },
    { date: new Date(2026, 5, 11), team1: "USA", team2: "Costa Rica", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Los Angeles" },
    { date: new Date(2026, 5, 12), team1: "Brazil", team2: "Argentina", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "New York" },
    { date: new Date(2026, 5, 12), team1: "France", team2: "Germany", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Miami" },
    { date: new Date(2026, 5, 13), team1: "Spain", team2: "Italy", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Dallas" },
    { date: new Date(2026, 5, 13), team1: "England", team2: "Netherlands", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Toronto" },
    { date: new Date(2026, 5, 14), team1: "Portugal", team2: "Belgium", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Vancouver" },
    { date: new Date(2026, 5, 14), team1: "Croatia", team2: "Morocco", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Seattle" },
    { date: new Date(2026, 5, 15), team1: "Japan", team2: "South Korea", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "San Francisco" },
    { date: new Date(2026, 5, 15), team1: "Uruguay", team2: "Colombia", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Philadelphia" },
    { date: new Date(2026, 5, 16), team1: "Senegal", team2: "Ghana", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Atlanta" },
    { date: new Date(2026, 5, 16), team1: "Egypt", team2: "Nigeria", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Boston" },
    { date: new Date(2026, 5, 17), team1: "Australia", team2: "New Zealand", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Kansas City" },
    { date: new Date(2026, 5, 17), team1: "Saudi Arabia", team2: "Qatar", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Houston" },
    { date: new Date(2026, 5, 18), team1: "Iran", team2: "Iraq", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Chicago" },
    { date: new Date(2026, 5, 18), team1: "Poland", team2: "Denmark", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Montreal" },
    { date: new Date(2026, 5, 19), team1: "Switzerland", team2: "Serbia", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Denver" },
    { date: new Date(2026, 5, 19), team1: "Sweden", team2: "Norway", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Portland" },
    { date: new Date(2026, 5, 20), team1: "Chile", team2: "Ecuador", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Nashville" },
    { date: new Date(2026, 5, 20), team1: "Peru", team2: "Paraguay", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Orlando" },
    { date: new Date(2026, 5, 21), team1: "Mexico", team2: "USA", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Mexico City" },
    { date: new Date(2026, 5, 21), team1: "Brazil", team2: "France", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "New York" },
    { date: new Date(2026, 5, 22), team1: "Argentina", team2: "Germany", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Miami" },
    { date: new Date(2026, 5, 22), team1: "Spain", team2: "England", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Dallas" },
    { date: new Date(2026, 5, 23), team1: "Italy", team2: "Netherlands", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Toronto" },
    { date: new Date(2026, 5, 23), team1: "Portugal", team2: "Croatia", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Vancouver" },
    { date: new Date(2026, 5, 24), team1: "Belgium", team2: "Morocco", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Seattle" },
    { date: new Date(2026, 5, 24), team1: "Japan", team2: "Uruguay", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "San Francisco" },
    { date: new Date(2026, 5, 25), team1: "South Korea", team2: "Colombia", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Philadelphia" },
    { date: new Date(2026, 5, 25), team1: "Senegal", team2: "Egypt", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Atlanta" },
    { date: new Date(2026, 5, 26), team1: "Ghana", team2: "Nigeria", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Boston" },
    { date: new Date(2026, 5, 26), team1: "Canada", team2: "Costa Rica", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Los Angeles" },
    { date: new Date(2026, 5, 27), team1: "Mexico", team2: "USA", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Chicago" },
    
    // Round of 32 - June 28 - July 2, 2026
    { date: new Date(2026, 5, 28), team1: "Group A Winner", team2: "Group B Runner-up", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "New York" },
    { date: new Date(2026, 5, 28), team1: "Group C Winner", team2: "Group D Runner-up", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Miami" },
    { date: new Date(2026, 5, 29), team1: "Group E Winner", team2: "Group F Runner-up", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Dallas" },
    { date: new Date(2026, 5, 29), team1: "Group G Winner", team2: "Group H Runner-up", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Toronto" },
    { date: new Date(2026, 5, 30), team1: "Group B Winner", team2: "Group A Runner-up", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Vancouver" },
    { date: new Date(2026, 5, 30), team1: "Group D Winner", team2: "Group C Runner-up", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Seattle" },
    { date: new Date(2026, 6, 1), team1: "Group F Winner", team2: "Group E Runner-up", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "San Francisco" },
    { date: new Date(2026, 6, 1), team1: "Group H Winner", team2: "Group G Runner-up", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Philadelphia" },
    { date: new Date(2026, 6, 2), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Atlanta" },
    { date: new Date(2026, 6, 2), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Boston" },
    
    // Round of 16 - July 3-6, 2026
    { date: new Date(2026, 6, 3), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "New York" },
    { date: new Date(2026, 6, 3), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "22:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Miami" },
    { date: new Date(2026, 6, 4), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Dallas" },
    { date: new Date(2026, 6, 4), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Toronto" },
    { date: new Date(2026, 6, 5), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Vancouver" },
    { date: new Date(2026, 6, 5), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "22:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Seattle" },
    { date: new Date(2026, 6, 6), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "San Francisco" },
    { date: new Date(2026, 6, 6), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Philadelphia" },
    
    // Quarter-finals - July 9-10, 2026
    { date: new Date(2026, 6, 9), team1: "Round of 16 Winner", team2: "Round of 16 Winner", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Quarter-finals", venue: "New York" },
    { date: new Date(2026, 6, 9), team1: "Round of 16 Winner", team2: "Round of 16 Winner", time: "22:00", tournament: "FIFA World Cup 2026", stage: "Quarter-finals", venue: "Miami" },
    { date: new Date(2026, 6, 10), team1: "Round of 16 Winner", team2: "Round of 16 Winner", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Quarter-finals", venue: "Dallas" },
    { date: new Date(2026, 6, 10), team1: "Round of 16 Winner", team2: "Round of 16 Winner", time: "22:00", tournament: "FIFA World Cup 2026", stage: "Quarter-finals", venue: "Toronto" },
    
    // Semi-finals - July 14-15, 2026
    { date: new Date(2026, 6, 14), team1: "Quarter-final Winner", team2: "Quarter-final Winner", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Semi-finals", venue: "New York" },
    { date: new Date(2026, 6, 15), team1: "Quarter-final Winner", team2: "Quarter-final Winner", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Semi-finals", venue: "Miami" },
    
    // Third Place Match - July 18, 2026
    { date: new Date(2026, 6, 18), team1: "Semi-final Loser", team2: "Semi-final Loser", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Third Place", venue: "Dallas" },
    
    // Final - July 19, 2026
    { date: new Date(2026, 6, 19), team1: "Semi-final Winner", team2: "Semi-final Winner", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Final", venue: "New York" },
  ];

  // Filter to get only upcoming matches (matches on or after today)
  const upcomingMatches = fifa2026Matches
    .filter((match) => {
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);
      return matchDate >= today;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime()) // Sort by date ascending
    .slice(0, 10) // Get the next 10 upcoming matches
    .map((match, index) => {
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);
      const isToday = matchDate.getTime() === today.getTime();
      
      return {
        id: `fifa2026-${index + 1}`,
        team1: match.team1,
        team2: match.team2,
        score1: undefined,
        score2: undefined,
        time: match.time,
        date: match.date,
        tournament: match.tournament,
        status: isToday ? ("live" as const) : ("upcoming" as const),
        type: "match" as const,
      };
    });

  return upcomingMatches;
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
