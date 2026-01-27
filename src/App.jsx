import React, { useEffect, useState, createContext, useCallback } from "react";
import "./App.css";
import ActivityTable from "./components/ActivityTable";
import { CircularProgress, Box } from "@mui/material";
import DateRangeModal from "./components/atom/DateRangeModal";

const ZOHO = window.ZOHO;

export const ZohoContext = createContext();

function App() {
  // --- State Management ---
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [recentColors, setRecentColor] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  // Filter & Cache States
  const [filterDate, setFilterDate] = useState("Default");
  const [customDateRange, setCustomDateRange] = useState(null);
  const [cache, setCache] = useState({}); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 1. Initialization ---
  useEffect(() => {
    ZOHO.embeddedApp.init().then(() => {
      setZohoLoaded(true);
      ZOHO.CRM.CONFIG.getCurrentUser().then((data) => {
        setLoggedInUser(data?.users[0]);
      });
    });
  }, []);

  // --- 2. Initial Metadata Fetch (Users & Colors) ---
  // We only fetch this ONCE when Zoho loads, not on every filter change.
  useEffect(() => {
    if (zohoLoaded) {
      fetchInitialMetadata();
    }
  }, [zohoLoaded]);

  const fetchInitialMetadata = async () => {
    try {
      // Fetch Colors
      const orgVar = await ZOHO.CRM.API.getOrgVariable("recent_colors");
      const colorsArray = JSON.parse(orgVar?.Success?.Content || "[]");
      setRecentColor(colorsArray);

      // Fetch Users
      const usersResponse = await ZOHO.CRM.API.getAllRecords({
        Entity: "users",
        sort_order: "asc",
        per_page: 100,
        page: 1,
      });
      setUsers(usersResponse.users || []);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  // --- 3. Date Utility Helper ---
  const calculateDateRange = (filterType, customRange) => {
    const currentDate = new Date();
    let beginDate, closeDate;

    switch (filterType) {
      case "Default":
        // Last month start to 1 year future
        beginDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        closeDate = new Date(currentDate);
        closeDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      case "All":
        beginDate = new Date("2023-01-01");
        closeDate = new Date();
        break;
      case "Current Week":
        beginDate = new Date(currentDate);
        beginDate.setDate(currentDate.getDate() - currentDate.getDay());
        closeDate = new Date(beginDate);
        closeDate.setDate(beginDate.getDate() + 6);
        break;
      case "Last 7 Days":
        closeDate = new Date(currentDate);
        beginDate = new Date(currentDate);
        beginDate.setDate(currentDate.getDate() - 6);
        break;
      case "Last 30 Days":
        closeDate = new Date(currentDate);
        beginDate = new Date(currentDate);
        beginDate.setDate(currentDate.getDate() - 29);
        break;
      case "Last 90 Days":
        closeDate = new Date(currentDate);
        beginDate = new Date(currentDate);
        beginDate.setDate(currentDate.getDate() - 89);
        break;
      case "Last Month":
        beginDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        closeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        break;
      case "Current Month":
        beginDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        closeDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        break;
      case "Next Week":
        beginDate = new Date(currentDate);
        beginDate.setDate(currentDate.getDate() - currentDate.getDay() + 7);
        closeDate = new Date(beginDate);
        closeDate.setDate(beginDate.getDate() + 6);
        break;
      case "Custom Range":
        if (customRange) {
          beginDate = new Date(customRange.startDate + "T00:00:00");
          closeDate = new Date(customRange.endDate + "T23:59:59");
        }
        break;
      default:
        return null;
    }
    return { beginDate, closeDate };
  };

  // --- 4. Zoho Date Formatter ---
  const formatDateForZoho = (date, hours = 0, minutes = 0, seconds = 0) => {
    if (!date || isNaN(date.getTime())) return null;
    const pad = (num) => String(num).padStart(2, "0");
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    
    const timezoneOffset = -date.getTimezoneOffset();
    const offsetSign = timezoneOffset >= 0 ? "+" : "-";
    const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
    const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);
    
    return `${year}-${month}-${day}T${formattedTime}${offsetSign}${offsetHours}:${offsetMinutes}`;
  };

  // --- 5. Core API Fetch Logic ---
  const fetchEventsFromZoho = async (beginDate, closeDate) => {
    const formattedBegin = formatDateForZoho(beginDate, 0, 0, 0);
    const formattedClose = formatDateForZoho(closeDate, 23, 59, 59);

    let allEventsData = [];
    let currentPage = 1;
    let hasMoreRecords = true;
    const recordsPerPage = 100;

    // Pagination Loop
    while (hasMoreRecords && currentPage < 11) {
      const searchUrl = `((Start_DateTime:greater_equal:${encodeURIComponent(formattedBegin)})and(End_DateTime:less_equal:${encodeURIComponent(formattedClose)}))`;
      
      const req_data = {
        url: `https://www.zohoapis.com.au/crm/v3/Events/search?criteria=${searchUrl}&per_page=${recordsPerPage}&page=${currentPage}`,
        method: "GET",
        param_type: 1,
      };

      try {
        const data = await ZOHO.CRM.CONNECTION.invoke("zoho_crm_conn", req_data);
        const pageEvents = data?.details?.statusMessage?.data || [];
        const moreRecords = data?.details?.statusMessage?.info?.more_records || false;

        allEventsData = [...allEventsData, ...pageEvents];
        hasMoreRecords = moreRecords;
        currentPage++;
      } catch (error) {
        console.error("Pagination error:", error);
        hasMoreRecords = false;
      }
    }

    return allEventsData;
  };

  // --- 6. Event Processing (Sort/Dedupe) ---
  const processEvents = (rawEvents) => {
    const uniqueEventsMap = new Map();
    rawEvents.forEach((event) => {
      if (!uniqueEventsMap.has(event.id)) {
        uniqueEventsMap.set(event.id, event);
      }
    });
    
    return Array.from(uniqueEventsMap.values()).sort((a, b) => {
      return new Date(a.Start_DateTime) - new Date(b.Start_DateTime);
    });
  };

  // --- 7. Specific Fetch Handlers ---

  const handleStandardFilter = async (filterType) => {
    // 1. Check Cache
    if (cache[filterType]) {
      setEvents(cache[filterType]);
      setLoading(false);
      return;
    }

    // 2. Calculate Dates
    const dates = calculateDateRange(filterType);
    if (!dates) return;

    setLoading(true);
    try {
      // 3. Fetch
      const rawData = await fetchEventsFromZoho(dates.beginDate, dates.closeDate);
      
      // 4. Process
      const processedData = processEvents(rawData);

      // 5. Update Cache and State
      setCache((prev) => ({ ...prev, [filterType]: processedData }));
      setEvents(processedData);
    } catch (error) {
      console.error(`Error loading ${filterType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRange = async (range) => {
    // Custom range never uses cache
    if (!range) return;

    setLoading(true);
    try {
      const dates = calculateDateRange("Custom Range", range);
      const rawData = await fetchEventsFromZoho(dates.beginDate, dates.closeDate);
      // We process but do NOT cache custom ranges
      const processedData = processEvents(rawData);
      setEvents(processedData);
    } catch (error) {
      console.error("Error loading custom range:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 8. Main Effect Controller ---
  useEffect(() => {
    if (!zohoLoaded) return;

    if (filterDate === "Custom Range") {
      // Only fetch if we actually have a range selected
      if (customDateRange) {
        handleCustomRange(customDateRange);
      }
    } else {
      handleStandardFilter(filterDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zohoLoaded, filterDate, customDateRange]);


  const handleCustomRangeSave = (range) => {
    setCustomDateRange(range);
    setFilterDate("Custom Range");
  };

  return (
    <ZohoContext.Provider
      value={{
        users,
        events,
        ZOHO,
        filterDate,
        setFilterDate,
        customDateRange,
        setCustomDateRange,
        recentColors,
        setRecentColor,
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <ActivityTable
          events={events}
          ZOHO={ZOHO}
          users={users}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          recentColors={recentColors}
          setRecentColor={setRecentColor}
          loggedInUser={loggedInUser}
          setEvents={setEvents}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
        />
      )}
      <DateRangeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCustomRangeSave}
      />
    </ZohoContext.Provider>
  );
}

export default App;