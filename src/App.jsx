import React, { useEffect, useState, createContext } from "react";
import "./App.css";
import ActivityTable from "./components/ActivityTable";
import { CircularProgress, Box } from "@mui/material"; // Add MUI CircularProgress for the loader
import DateRangeModal from "./components/atom/DateRangeModal";

const ZOHO = window.ZOHO;

// Create a ZohoContext to hold the ZOHO data
export const ZohoContext = createContext();

function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [filterDate, setFilterDate] = useState("Default");
  const [cache, setCache] = useState({}); // Cache to store fetched results
  const [recentColors, setRecentColor] = useState(""); // Move this to context
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [customDateRange, setCustomDateRange] = useState(null); // State for custom date range
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  useEffect(() => {
    // Initialize Zoho Embedded App once
    ZOHO.embeddedApp.init().then(() => {
      setZohoLoaded(true);
      // Fetch the logged-in user
      ZOHO.CRM.CONFIG.getCurrentUser().then(function (data) {
        setLoggedInUser(data?.users[0]);
      });
    });
  }, []);

  const handleCustomRangeSave = (range) => {
    setCustomDateRange(range);
    setFilterDate("Custom Range");
  };

  useEffect(() => {
    async function getData() {
      if (cache[filterDate]) {
        setEvents(cache[filterDate]);
        setLoading(false);
        return;
      }

      if (zohoLoaded) {
        setLoading(true);
        try {
          let beginDate1, closeDate1;
          const currentDate = new Date();

          // Default: Last 30 days + future items
          if (!filterDate || filterDate === "Default") {
            beginDate1 = new Date(currentDate);
            beginDate1.setDate(currentDate.getDate() - 29); // Last 30 days
            closeDate1 = new Date(currentDate);
            closeDate1.setFullYear(currentDate.getFullYear() + 1); // Future items (1 year ahead)
          } else if (filterDate === "Custom Range" && customDateRange) {
            // Custom date range set by user
            beginDate1 = new Date(customDateRange.startDate);
            closeDate1 = new Date(customDateRange.endDate);
          } else if (filterDate === "All") {
            // Show all records from the beginning of the year to now
            beginDate1 = new Date("2023-01-01");
            closeDate1 = new Date();
          } else if (filterDate === "Current Week") {
            // Start of current week (Sunday to Saturday)
            beginDate1 = new Date(currentDate);
            beginDate1.setDate(currentDate.getDate() - currentDate.getDay());
            closeDate1 = new Date(beginDate1);
            closeDate1.setDate(beginDate1.getDate() + 6);
          } else if (filterDate === "Last 7 Days") {
            // Last 7 days up to the current date
            closeDate1 = new Date(currentDate);
            beginDate1 = new Date(currentDate);
            beginDate1.setDate(currentDate.getDate() - 6);
          } else if (filterDate === "Last 30 Days") {
            // Last 30 days up to the current date
            closeDate1 = new Date(currentDate);
            beginDate1 = new Date(currentDate);
            beginDate1.setDate(currentDate.getDate() - 29);
          } else if (filterDate === "Last 90 Days") {
            // Last 90 days up to the current date
            closeDate1 = new Date(currentDate);
            beginDate1 = new Date(currentDate);
            beginDate1.setDate(currentDate.getDate() - 89);
          } else if (filterDate === "Current Month") {
            // First day of the current month to the last day of the current month
            beginDate1 = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              1
            );
            closeDate1 = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0
            );
          } else if (filterDate === "Next Week") {
            // Next week (from the next Sunday to the following Saturday)
            beginDate1 = new Date(currentDate);
            beginDate1.setDate(
              currentDate.getDate() - currentDate.getDay() + 7
            ); // Next Sunday
            closeDate1 = new Date(beginDate1);
            closeDate1.setDate(beginDate1.getDate() + 6); // Following Saturday
          }

          // Format dates for API request
          const formattedBeginDate = `${
            beginDate1.toISOString().split("T")[0]
          }T00:00:00+11:00`;
          const formattedCloseDate = `${
            closeDate1.toISOString().split("T")[0]
          }T23:59:59+11:00`;

          // Replace the single API call with pagination loop
          let allEventsData = [];
          let currentPage = 1;
          let hasMoreRecords = true;
          let recordsPerPage = 100;

          while (hasMoreRecords && currentPage < 11) {
            const req_data_meetings = {
              url: `https://www.zohoapis.com.au/crm/v3/Events/search?criteria=((Start_DateTime:greater_equal:${encodeURIComponent(
                formattedBeginDate
              )})and(End_DateTime:less_equal:${encodeURIComponent(
                formattedCloseDate
              )}))&per_page=${recordsPerPage}&page=${currentPage}`,
              method: "GET",
              param_type: 1,
            };

            try {
              // Fetch data for current page
              const data = await ZOHO.CRM.CONNECTION.invoke(
                "zoho_crm_conn",
                req_data_meetings
              );

              console.log(`Page ${currentPage} data:`, data);

              const pageEventsData = data?.details?.statusMessage?.data || [];
              const moreRecords = data?.details?.statusMessage?.info?.more_records || false;

              // Add current page data to all events
              allEventsData = [...allEventsData, ...pageEventsData];

              // Check if there are more records to fetch
              hasMoreRecords = moreRecords;
              currentPage++;

              console.log(`Fetched page ${currentPage - 1}, more records: ${moreRecords}, total events so far: ${allEventsData.length}`);

            } catch (error) {
              console.error(`Error fetching page ${currentPage}:`, error);
              hasMoreRecords = false; // Stop pagination on error
            }
          }

          console.log(`Total events fetched: ${allEventsData.length}`);

          // Replace: const eventsData = data1?.details?.statusMessage?.data || [];
          // With:
          const eventsData = allEventsData;

          // const req_data_meetings1 = {
          //   url: `https://www.zohoapis.com.au/crm/v3/Events/search?criteria=((Start_DateTime:greater_equal:${encodeURIComponent(
          //     formattedBeginDate
          //   )})and(End_DateTime:less_equal:${encodeURIComponent(
          //     formattedCloseDate
          //   )}))&per_page=10&page=1`,
          //   method: "GET",
          //   param_type: 1,
          // };

          // // Fetch data
          // const data1 = await ZOHO.CRM.CONNECTION.invoke(
          //   "zoho_crm_conn",
          //   req_data_meetings1
          // );

          // console.log({data1})

          // // console.log("mahadi data fetch", data1?.details?.statusMessage?.info?.more_records)

          // const eventsData = data1?.details?.statusMessage?.data || [];
          
          let combinedEvents = [];
          if (filterDate === "Custom Range") {
            setEvents(eventsData);
          } else {
            const allMeetings = await ZOHO.CRM.API.getAllRecords({
              Entity: "Events",
              sort_order: "asc",
              per_page: 100,
              page: 1,
            });
            const allMeetingsData = allMeetings?.data || [];
            combinedEvents = [...eventsData, ...allMeetingsData];
            // Filter events by date range
            const filteredEvents = combinedEvents.filter((event) => {
              const eventStart = new Date(event.Start_DateTime);
              const eventEnd = new Date(event.End_DateTime);
              return eventStart >= beginDate1 && eventEnd <= closeDate1;
            });

            // Deduplicate events based on `id`
            const uniqueEventsMap = new Map();
            filteredEvents.forEach((event) => {
              if (!uniqueEventsMap.has(event.id)) {
                uniqueEventsMap.set(event.id, event);
              }
            });
            const uniqueEvents = Array.from(uniqueEventsMap.values());

            // Sort events by `Start_DateTime`
            const sortedUniqueEvents = uniqueEvents.sort((a, b) => {
              return new Date(a.Start_DateTime) - new Date(b.Start_DateTime);
            });

            // Cache and update state
            setCache((prevCache) => ({
              ...prevCache,
              [filterDate]: sortedUniqueEvents,
            }));

            setEvents(sortedUniqueEvents);
          }

          // Fetch org variable and users
          const orgVar = await ZOHO.CRM.API.getOrgVariable("recent_colors");
          const colorsArray = JSON.parse(orgVar?.Success?.Content || "[]");
          setRecentColor(colorsArray);

          const usersResponse = await ZOHO.CRM.API.getAllRecords({
            Entity: "users",
            sort_order: "asc",
            per_page: 100,
            page: 1,
          });
          setUsers(usersResponse.users);

          setLoading(false);
        } catch (error) {
          console.error("Error fetching data", error);
          setLoading(false);
        }
      }
    }

    getData();
  }, [zohoLoaded, filterDate, customDateRange, cache]);

  return (
    <ZohoContext.Provider
      value={{
        users,
        events,
        ZOHO,
        filterDate,
        setFilterDate,
        customDateRange, // Provide customDateRange for context
        setCustomDateRange, // Provide setCustomDateRange for context
        recentColors,
        setRecentColor,
      }}
    >
      {/* Conditionally render the loader or the main content */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress /> {/* MUI loader */}
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
          customDateRange={customDateRange} // Pass customDateRange to ActivityTable
          setCustomDateRange={setCustomDateRange} // Pass setCustomDateRange to ActivityTable
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