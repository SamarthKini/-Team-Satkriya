import { toast } from "react-toastify";
import {
  createWorkShopType,
  fetchAllWorkshopsType,
  fetchWorkshopByIdType,
  GetFilteredWorkshopType,
  GetWorkshopRegistrationDetailsType,
  RegisterWorkshopType,
} from "./useWorkShop.types";
import { uploadImageToCloudinary } from "./useWorkShopUtility";
import { auth, db } from "@/firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import WorkShop, { Registration } from "@/types/workShop.types";
import { useNavigate } from "react-router-dom";

const useWorkShop = () => {
  const navigate = useNavigate();

  const getAllYourWorkshops = async (): Promise<WorkShop[] | null> => {
    try {
      // Check authentication
      const user = auth.currentUser;
      if (!user) {
        toast.warn("Please login to view your workshops");
        return null;
      }

      // Create query for workshops owned by current user
      const workshopsQuery = query(
        collection(db, "workshops"),
        where("owner", "==", user.uid), // Changed from "ownerId" to match your createWorkshop field
        orderBy("createdAt", "desc") // Added sorting by creation date
      );

      // Execute query
      const querySnapshot = await getDocs(workshopsQuery);

      // Transform documents into Workshop objects
      const workshops = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as WorkShop)
      );

      return workshops;
    } catch (error) {
      console.error("Error fetching workshops:", error);
      toast.error("Failed to load your workshops");
      return null;
    }
  };

  const createWorkshop: createWorkShopType = async (workshopData, filters) => {
    // Early exit if unauthenticated
    const user = auth.currentUser;
    if (!user) {
      toast.warn("Authentication required");
      return null;
    }

    try {
      // Parallelize independent operations
      const [uploadedImageUrl, userDocSnap] = await Promise.all([
        uploadImageToCloudinary(workshopData.thumbnail),
        getDoc(doc(db, "experts", user.uid)),
      ]);

      // Validate prerequisites
      if (!uploadedImageUrl) {
        toast.error("Image upload failed");
        return null;
      }
      if (!userDocSnap.exists()) {
        toast.error("Expert profile missing");
        return null;
      }

      // Prepare data with atomic writes
      const batch = writeBatch(db);
      const workshopRef = doc(collection(db, "workshops"));

      const workshopDoc = {
        title: workshopData.title.trim(),
        description: workshopData.description.trim().replace(/\n/g, "\\n"),
        dateFrom: new Date(workshopData.dateFrom),
        dateTo: new Date(workshopData.dateTo),
        timeFrom: workshopData.timeFrom,
        timeTo: workshopData.timeTo,
        mode: workshopData.mode,
        location:
          workshopData.mode === "offline"
            ? workshopData.location?.trim()
            : null,
        link: workshopData.mode === "online" ? workshopData.link?.trim() : null,
        thumbnail: uploadedImageUrl,
        filters,
        owner: user.uid,
        role: userDocSnap.data().role,
        registrations: [],
        profileData: {
          name: userDocSnap.data().name.trim(),
          profilePic: userDocSnap.data().profilePic || "",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Atomic write operations
      batch.set(workshopRef, workshopDoc);
      batch.update(doc(db, "experts", user.uid), {
        workshops: arrayUnion(workshopRef.id),
      });

      await batch.commit();
      toast.success("Workshop created!");
      return workshopRef.id;
    } catch (error) {
      console.error("Workshop creation failed:", error);
      toast.error(error instanceof Error ? error.message : "Creation error");
      return null;
    }
  };

  const fetchWorkshopById: fetchWorkshopByIdType = async (id: string) => {
    try {
      // 1. Authentication Check
      const user = auth.currentUser;
      if (!user) {
        toast.warn("Please login to view workshop details");
        return null;
      }

      // 2. Document Reference
      const workshopRef = doc(db, "workshops", id);
      const workshopSnap = await getDoc(workshopRef);

      // 3. Existence Check
      if (!workshopSnap.exists()) {
        toast.error("Workshop not found");
        return null;
      }

      // 4. Data Processing
      const workshopData = workshopSnap.data();

        // Check if current user is registered
        const isRegistered =
        workshopData.registrations.some((reg: Registration) => reg.id === auth.currentUser?.uid)

      // 5. Return Typed Workshop Object
      return {
        id: workshopSnap.id,
        currUserRegistered: isRegistered,
        ...workshopData,
      } as WorkShop;
    } catch (error) {
      // 6. Error Handling
      console.error(`Failed to fetch workshop ${id}:`, error);
      toast.error("Error loading workshop details");
      return null;
    }
  };

  const fetchAllWorkshops: fetchAllWorkshopsType = async () => {
    // Early return if no authenticated user
    if (!auth.currentUser) {
      toast.warn("Please login to view workshops");
      return null;
    }

    try {
      // Set up query for upcoming workshops
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day

      const workshopsQuery = query(
        collection(db, "workshops"),
        where("dateFrom", ">=", Timestamp.fromDate(today)), // Only future workshops
        orderBy("dateFrom", "asc") // Earliest first
      );

      // Execute query with error handling
      const querySnapshot = await getDocs(workshopsQuery);

      // Handle empty result set
      if (querySnapshot.empty) {
        toast.info("No upcoming workshops available");
        return []; // Return empty array for easier consumption
      }

      // Transform Firestore documents to Workshop objects
      return querySnapshot.docs.map((doc) => {
        const workshopData = doc.data();

         // Check if current user is registered
         const isRegistered =
         workshopData.registrations.some((reg: Registration) => reg.id === auth.currentUser?.uid)

        return {
          id: doc.id,
          currUserRegistered: isRegistered,
          ...workshopData,
        } as WorkShop;
      });
    } catch (error) {
      // 6. Error Handling
      console.error(`Failed to fetch workshops:`, error);
      toast.error("Error loading workshop details");
      return null;
    }
  };

  const fetchFilteredWorkshops: GetFilteredWorkshopType = async (
    filters,
    userType
  ) => {
    if (!auth.currentUser) {
      return null;
    }
    try {
      const postsRef = collection(db, "workshops");

      let q;

      if (userType !== null && filters.length > 0) {
        q = query(
          postsRef,
          where("filters", "array-contains-any", filters),
          where("role", "==", userType)
        );
      } else if (userType === null && filters.length > 0) {
        q = query(postsRef, where("filters", "array-contains-any", filters));
      } else {
        q = query(postsRef, where("role", "==", userType));
      }
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return [];
      }

      const filteredWorkShops = querySnapshot.docs.map((doc) => {
        const workShopData = doc.data();

        // Check if current user is registered
        const isRegistered =
        workShopData.registrations.some((reg: Registration) => reg.id === auth.currentUser?.uid);

        return {
          id: doc.id,
          currUserRegistered: isRegistered,
          ...workShopData,
        } as WorkShop;
      });

      return filteredWorkShops;
    } catch (error) {
      console.error("Error fetching filtered posts:", error);
      return [];
    }
  };

  const registerWorkShop: RegisterWorkshopType = async (
    workshopId,
    userType
  ) => {
    try {
      // Validate current user
      const user = auth.currentUser;
      if (!user) {
        toast.error("You must login to register for workshops");
        navigate("/auth");
        return;
      }

      // Get user document reference and snapshot
      const userDocRef = doc(db, userType, user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // Verify user exists
      if (!userDocSnap.exists()) {
        toast.error("User account not found");
        return;
      }

      const userData = userDocSnap.data();

      // Check for existing registration
      const workshopDocRef = doc(db, "workshops", workshopId);
      const workshopSnap = await getDoc(workshopDocRef);

      if (!workshopSnap.exists()) {
        toast.error("Workshop not found");
        return;
      }

      const existingRegistrations = workshopSnap.data().registrations || [];
      if (
        existingRegistrations.some((reg: Registration) => reg.id === user.uid)
      ) {
        toast.warn("Already registered");
        return;
      }

      // 3. Prepare batch
      const batch = writeBatch(db);
      // Prepare registration data
      const registrationData = {
        id: user.uid,
        name: userData.name,
        contactNo: userData.contactNo,
        role: userData.role,
      };

      // 4. Add operations to batch
      batch.update(workshopDocRef, {
        registrations: arrayUnion(registrationData),
        updatedAt: new Date(),
      });

      batch.update(userDocRef, {
        registrations: arrayUnion(workshopId),
        updatedAt: new Date(),
      });

      // 5. Commit batch
      await batch.commit();
      toast.success("Registration successful!");
    } catch (error) {
      console.error("Workshop registration failed:", error);
      toast.error("Failed to register for workshop");
    }
  };

  const getWorkshopRegistrationDetails: GetWorkshopRegistrationDetailsType =
    async (workshopId) => {
      try {
        // Validate current user
        const user = auth.currentUser;
        if (!user) {
          toast.error("Authentication required to view registrations");
          navigate("/auth");
          return;
        }

        // Get workshop document
        const workshopDoc = await getDoc(doc(db, "workshops", workshopId));

        // Verify workshop exists
        if (!workshopDoc.exists()) {
          toast.warn("The requested workshop does not exist");
          navigate("/workshops");
          return;
        }

        // Verify user is the workshop owner
        if (user.uid !== workshopDoc.data().owner) {
          toast.warn("Only the workshop owner can view registration details");
          navigate("/workshops");
          return;
        }

        // Type-safe extraction of workshop data
        const workshopData = {
          id: workshopDoc.id,
          ...workshopDoc.data(),
        } as WorkShop;

        // Return registration details if they exist, otherwise empty array
        return workshopData;
      } catch (error) {
        console.error("Failed to fetch registration details:", error);
        toast.error("Error loading registration information");
        return; // Return empty array on failure
      }
    };

  return {
    createWorkshop,
    fetchWorkshopById,
    fetchAllWorkshops,
    fetchFilteredWorkshops,
    registerWorkShop,
    getWorkshopRegistrationDetails,
    getAllYourWorkshops,
  };
};

export default useWorkShop;
