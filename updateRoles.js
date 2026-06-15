// forceInsertCareers.js
const mongoose = require("mongoose");

// ==========================================
// 1. CONFIGURATION & INFRASTRUCTURE GATEWAY
// ==========================================
// 🔥 APNE MONGODB ATLAS YA LOCAL KA CONNECTION STRING YAHA REPLACES KAREIN
const MONGO_URI="mongodb+srv://Techflora2026:Techflora2026@cluster0.fpdzyfd.mongodb.net/techflora?retryWrites=true&w=majority&appName=Techflora_Public"

// 🔥 AAPKI SHARED VALID ADMIN OBJECT ID EXACTLY INJECTED
const TARGET_ADMIN_ID = "6a28022086a3dd328db56a21";

// ==========================================
// 2. RUNTIME INLINE MODEL SCHEMA DEFINITION
// ==========================================
const InlineRegistrySchema = new mongoose.Schema({
  contentType: { type: String, required: true },
  designation: { type: String, required: true },
  noOfOpenings: { type: Number, required: true },
  department: { type: String, default: "General Operations" },
  isActive: { type: Boolean, default: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

const QuickInfoRegistry = mongoose.models.InfoRegistry || mongoose.model("InfoRegistry", InlineRegistrySchema, "inforegistries");

// ==========================================
// 3. TARGET DATA PACKETS ARRAY MATRIX (CAREER)
// ==========================================
const cleanCareerPayloads = [
  {
    contentType: "Job",
    designation: "Sales Advisor",
    noOfOpenings: 2,
    department: "Sales & Business Development",
    isActive: true,
    uploadedBy: new mongoose.Types.ObjectId(TARGET_ADMIN_ID)
  },
  {
    contentType: "Job",
    designation: "Tele Calling Executive",
    noOfOpenings: 2,
    department: "Customer Support & Tele Sales",
    isActive: true,
    uploadedBy: new mongoose.Types.ObjectId(TARGET_ADMIN_ID)
  },
  {
    contentType: "Job",
    designation: "HR Executive",
    noOfOpenings: 2,
    department: "Human Resources",
    isActive: true,
    uploadedBy: new mongoose.Types.ObjectId(TARGET_ADMIN_ID)
  },
  {
    contentType: "Job",
    designation: "Payroll Executive",
    noOfOpenings: 2,
    department: "Finance & Accounts",
    isActive: true,
    uploadedBy: new mongoose.Types.ObjectId(TARGET_ADMIN_ID)
  },
  {
    contentType: "Job",
    designation: "Recruitment Consultant",
    noOfOpenings: 3,
    department: "Talent Acquisition",
    isActive: true,
    uploadedBy: new mongoose.Types.ObjectId(TARGET_ADMIN_ID)
  },
  {
    contentType: "Job",
    designation: "Back Office Executive",
    noOfOpenings: 2,
    department: "Operations",
    isActive: true,
    uploadedBy: new mongoose.Types.ObjectId(TARGET_ADMIN_ID)
  },
  {
    contentType: "Job",
    designation: "HR Recruiter",
    noOfOpenings: 3,
    department: "Human Resources",
    isActive: true,
    uploadedBy: new mongoose.Types.ObjectId(TARGET_ADMIN_ID)
  },
  {
    contentType: "Job",
    designation: "Business Development Executive",
    noOfOpenings: 2,
    department: "Sales & Business Development",
    isActive: true,
    uploadedBy: new mongoose.Types.ObjectId(TARGET_ADMIN_ID)
  }
];

// ==========================================
// 4. TRANSACTION ENGINE EXECUTION MODULE
// ==========================================
async function runForceInsertion() {
  try {
    if (MONGO_URI === "mongodb+not-disclosed-string-here") {
      console.error("❌ Error: Script running aborted. Please put your real connection string inside MONGO_URI string variable.");
      process.exit(1);
    }

    console.log("🔄 Initializing connection matrix link to MongoDB Clusters...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Pipeline connected securely.");

    console.log(`🚀 Injecting full Career packet cluster into database index layers...`);
    const bulkResult = await QuickInfoRegistry.insertMany(cleanCareerPayloads, { ordered: false });
    
    console.log("⚡ ==========================================");
    console.log("✅ DATABASE BATCH TRANSFER OPERATION SUCCESSFUL!");
    console.log(`- Successfully inserted ${bulkResult.length} clean career documents into 'inforegistries' collection.`);
    console.log("⚡ ==========================================");
    
    await mongoose.connection.close();
    console.log("🔌 Database channel safely isolated. Process exited cleanly.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal Process Exception occurred during migration sequence:");
    console.error(error.message);
    process.exit(1);
  }
}

runForceInsertion();