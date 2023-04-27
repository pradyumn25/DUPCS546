import { Router } from "express";
import companyFunctions from "../data/company.js";
const router = Router();
import multer from "multer";
import { get } from "mongoose";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()} - ${file.originalname}`);
  },
});

const upload = multer({ storage });

router.route("/").get((req, res) => {
  res.render("company/createCompany", { title: "Create Company" });
});

router.route("/updateCompany/:name").get(async (req, res) => {
  let companyName = req.params.name;

  if (!companyName || companyName.trim().length === 0) return res.render('error', { error: 'Not a valid company name' });
  
  try {
    
    let getCompanyDetails = await companyFunctions.getCompanyDetailsFromCompanyName();
    if (!getCompanyDetails) throw "Error : No company Found";
    console.log(getCompanyDetails);

    res.render("company/updateCompany", { title: "Edit Company Details" });

  }catch(e) {
    return res.render('error', { title: 'Error', error: e});
  }
  
});

router.route("/data").post(upload.single("uploadImage"), async (req, res) => {
  const bodyData = req.body;
  // console.log(req.file);

  if (!bodyData || Object.keys(bodyData).length === 0) {
    return res
      .status(400)
      .render("error", { error: "There are no fields in the request body" });
  }

  // console.log(bodyData);
  let { companyName, industry, employee, location, description } = bodyData;
  let createdAt = new Date();
  
  try {
    const data = await companyFunctions.createComapny(
      companyName,
      industry,
      location,
      employee,
      description,
      createdAt,
      req.file.filename
    );

    // return res.json(data);
    return res.redirect(`/company/data/${companyName}`);
  } catch (e) {
    console.log(e);
    return res.status(500).render("error", { error: e });
  }
});

router.route("/data/:name").get(async (req, res) => {
  if (! req.params.name) return res.status(400).render({ title: 'Error',error: "Error : Invalid Company Name"}); // todo render a page;
  // return console.log(req.params.id);

  try{
    let companyData = await companyFunctions.getCompanyDetailsFromCompanyName( req.params.name );
    return res.render("company/displayCompany", { title: "Create Company", companyData: companyData});
  }catch(e) {
    return res.render('error', { error: e, title: 'Error' });
  }
  // console.log(companyData);

});

router.route("/dataUpdate/:name").get(async (req, res) => {
  if (! req.params.name) "Error : Invalid Company Name"; // todo render a page;
  // return console.log(req.params.id);

  try{
    let companyData = await companyFunctions.getCompanyDetailsFromCompanyName( req.params.name );
    return res.render("company/updateCompany", { title: "Update Company Details", companyData});
  
  }catch(e) {
    return res.render('error', { error: e, title: 'Error' });
  }
  // console.log(companyData);

});

export default router;
