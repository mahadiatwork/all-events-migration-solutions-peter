import { useEffect, useState, createContext } from "react"
import "./App.css"
import ActivityTable from "./components/ActivityTable"
import { CircularProgress, Box } from "@mui/material"

const ZOHO = window.ZOHO

// Create a ZohoContext to hold the ZOHO data
export const ZohoContext = createContext()

function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false)
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState("Default")
  const [cache, setCache] = useState({})
  const [recentColors, setRecentColor] = useState("")
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [entityId, setEntityId] = useState(null)
  const [currentContact, setCurrentContact] = useState(null)
  const [dataFetched, setDataFetched] = useState(false) // Track if initial data fetch is complete

  // Initialize Zoho
  useEffect(() => {
    const initializeZoho = async () => {
      try {
        // Set up PageLoad listener
        ZOHO.embeddedApp.on("PageLoad", (data) => {
          setEntityId(data.EntityId)
        })

        // Initialize Zoho Embedded App
        await ZOHO.embeddedApp.init()
        setZohoLoaded(true)

        // Fetch the logged-in user
        const userData = await ZOHO.CRM.CONFIG.getCurrentUser()
        console.log({ userData })
        setLoggedInUser(userData?.users[0])
      } catch (error) {
        console.error("Error initializing Zoho:", error)
        setLoading(false)
      }
    }

    initializeZoho()
  }, [])

  // Fetch data when Zoho is loaded and entityId is available
  useEffect(() => {
    const fetchAllData = async () => {
      // Only proceed if we have both zohoLoaded and entityId
      if (!zohoLoaded || !entityId) {
        return
      }

      // Check if the data for the current filterDate is already in the cache
      if (cache[filterDate] && dataFetched) {
        setEvents(cache[filterDate])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        // Fetch all meetings
        console.log("Fetching meetings...")
        const meetingsResponse = await ZOHO.CRM.API.getRelatedRecords({
          Entity: "Contacts",
          RecordID: entityId,
          RelatedList: "Invited_Events",
          page: 1,
          per_page: 200,
        })
        const allMeetingsData = meetingsResponse?.data || []
        console.log("Meetings fetched:", allMeetingsData.length)

        // Fetch current contact
        console.log("Fetching current contact...")
        const contactResponse = await ZOHO.CRM.API.getRecord({
          Entity: "Contacts",
          approved: "both",
          RecordID: entityId,
        })
        const contactData = contactResponse?.data?.[0] || null
        console.log("Contact fetched:", contactData?.id)

        // Get organization variable for recent colors
        console.log("Fetching recent colors...")
        const colorsResponse = await ZOHO.CRM.API.getOrgVariable("recent_colors")
        const colorsArray = JSON.parse(colorsResponse?.Success?.Content || "[]")
        console.log("Colors fetched:", colorsArray.length)

        // Get users data
        console.log("Fetching users...")
        const usersResponse = await ZOHO.CRM.API.getAllRecords({
          Entity: "users",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        })
        const usersData = usersResponse?.users || []
        console.log("Users fetched:", usersData.length)

        // Update all states after ALL data is fetched
        console.log("All data fetched successfully, updating states...")
        setEvents(allMeetingsData)
        setCurrentContact(contactData)
        setRecentColor(colorsArray)
        setUsers(usersData)

        // Cache the events data
        setCache((prevCache) => ({
          ...prevCache,
          [filterDate]: allMeetingsData,
        }))

        setDataFetched(true)
        console.log("All states updated, data fetch complete!")
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        // Always set loading to false when done
        setLoading(false)
        console.log("Loading set to false")
      }
    }

    fetchAllData()
  }, [zohoLoaded, entityId]) // Added entityId as dependency

  // Show loading until all data is fetched
  if (loading || !dataFetched) {
    return (
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
    )
  }

  return (
    <ZohoContext.Provider
      value={{
        users,
        events,
        ZOHO,
        filterDate,
        setFilterDate,
        recentColors,
        setRecentColor,
      }}
    >
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
        currentContact={currentContact}
      />
    </ZohoContext.Provider>
  )
}

export default App
