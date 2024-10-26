import React, { useEffect, useState, createContext, useContext } from "react";
import "./App.css";
import ActivityTable from "./components/ActivityTable";
import { CircularProgress, Box } from "@mui/material"; // Add MUI CircularProgress for the loader
import { subDays } from "date-fns";

const ZOHO = window.ZOHO;

// Create a ZohoContext to hold the ZOHO data
const ZohoContext = createContext();

function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [laborData, setLaborData] = useState([]);
  const [events, setEvents] = useState([]);
  const [todo, setTodo] = useState([]);
  const [calls, setCalls] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    ZOHO.embeddedApp.init().then(() => {
      setZohoLoaded(true);
    });
  }, []);

  useEffect(() => {
    async function getData() {
      if (zohoLoaded) {
        setLoading(true); // Set loading to true when data fetching starts
        try {
          // First request: Fetch all event records from Zoho CRM
          const allMeetings = await ZOHO.CRM.API.getAllRecords({
            Entity: "Events",
            sort_order: "asc",
            per_page: 100,
            page: 1,
          });
          setEvents(allMeetings.data); // Set the events in the state

          // Second request: Fetch all users from Zoho CRM
          const usersResponse = await ZOHO.CRM.API.getAllRecords({
            Entity: "users",
            sort_order: "asc",
            per_page: 100,
            page: 1,
          });
          setUsers(usersResponse.users); // Set the users in the state

          // Dynamic dates for event filtering using plain JavaScript
          const conn_name1 = "zoho_crm_conn";

          // Get the start of the current month
          const currentDate = new Date();
          const beginDate1 = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          const closeDate1 = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          );

          // Format the dates to YYYY-MM-DDTHH:MM:SS+Timezone
          const formattedBeginDate = `${beginDate1.getFullYear()}-${String(
            beginDate1.getMonth() + 1
          ).padStart(2, "0")}-${String(beginDate1.getDate()).padStart(
            2,
            "0"
          )}T00:00:00+11:00`;
          const formattedCloseDate = `${closeDate1.getFullYear()}-${String(
            closeDate1.getMonth() + 1
          ).padStart(2, "0")}-${String(closeDate1.getDate()).padStart(
            2,
            "0"
          )}T23:59:59+11:00`;



          // Custom event search with dynamic dates
          const req_data_meetings1 = {
            url: `https://www.zohoapis.com.au/crm/v3/Events/search?criteria=((Start_DateTime:greater_equal:${encodeURIComponent(
              formattedBeginDate
            )})and(End_DateTime:less_equal:${encodeURIComponent(
              formattedCloseDate
            )}))`,
            method: "GET",
            param_type: 1,
          };


          // Fetching data with custom search criteria
          const data1 = await ZOHO.CRM.CONNECTION.invoke(
            conn_name1,
            req_data_meetings1
          );
          console.log(
            "Custom event search results:",
            data1
          );

          // Ensure loading is turned off when the data fetching is complete
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data", error);
          setLoading(false); // Ensure loading is turned off even if there's an error
        }
      }
    }
    getData();
  }, [zohoLoaded]);

  return (
    <ZohoContext.Provider value={{ users, events, todo, ZOHO }}>
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
        <ActivityTable events={events} todo={todo} ZOHO={ZOHO} users={users} />
      )}
    </ZohoContext.Provider>
  );
}

export default App;
