var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { areIntervalsOverlapping, differenceInDays } from 'date-fns';
import express from 'express';
import path from 'path';
import axios from 'axios';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { failMessage, checkDates, getRequestsRows, getApprovedOrRejectedRequestsRows, getEmployeeRows, deleteRequestById, updateRequest, getDatesOfOneRequest, getOneRequest, getEmployeeRemainingHolidays, approveRequest, rejectRequest, addOneRequest } from './database_operations/database_operations.js';
import { 
//failMessage,
deleteRequestByIdFromMango, checkDatesFromMango, getEmployeeRowsFromMango, getOneRequestInMango, addOneRequestToMango, getRequestsRowsFromMango, getApprovedOrRejectedRequestsFromMango, updateRequestInMongo, approveRequestInMango, rejectRequestInMango, getDatesOfOneRequestInMongo, getEmployeeRemainingHolidaysFromMango } from "./database_operations/mango_operations.js";
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import { router, verifyToken } from './routes/users.js';
import invokePassport from './KeyPair/passport.js';
invokePassport(passport);
import { genKeyPair } from './KeyPair/generateKeypair.js';
genKeyPair();
import cookies from 'cookie-parser';
config();
const dbUrl = process.env.MONG_DB_URL;
mongoose.connect(dbUrl);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT);
// це частина паспорта також
app.use(passport.initialize());
app.use(cookies());
app.use(bodyParser.urlencoded());
app.use(express.urlencoded({ extended: true }));
//це частина паспорта також
app.use(cors());
app.use(router);
//Middleware for logging data about requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
});
app.listen(port, () => {
    console.log(`Server started at ${port} port`);
});
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
let successMessage;
let dbType = "sql";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        function fetchHolidays(year, countryCode) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield axios.get(`https://date.nager.at/api/v3/publicholidays/${year}/${countryCode}`);
                    return response.data;
                }
                catch (error) {
                    console.error('An error occurred while executing the request:', error);
                    return [];
                }
            });
        }
        const holidays = [];
        let relevantHolidays = [];
        fetchHolidays(2024, 'UA')
            .then((holidaysData) => {
            holidays.push(...holidaysData);
        })
            .catch((error) => {
            console.error('An error occurred while receiving holidays:', error);
        });
        //endpoints
        app.post('/delete-request', verifyToken, (req, res) => {
            try {
            }
            catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });
        app.delete('/delete-request', verifyToken, (req, res) => {
            try {
                const requestId = Number(req.query.requestId);
                const result = req.query.result;
                if (result) {
                    if (dbType == "Mongo") {
                        deleteRequestByIdFromMango(requestId);
                    }
                    else if (dbType === "sql") {
                        deleteRequestById(requestId);
                    }
                }
                successMessage = "Holiday request deleted successfully!";
                res.redirect('/holidays');
            }
            catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });
        app.get('/employees', verifyToken, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (dbType === "Mongo") {
                    const employeesJson = yield getEmployeeRowsFromMango();
                    res.render('employees', { employeesJson });
                }
                else if (dbType === "sql") {
                    const employeesJson = yield getEmployeeRows();
                    res.render('employees', { employeesJson });
                }
            }
            catch (e) {
                res.status(500).send('Internal Server Error');
            }
        }));
        //in the 3rd task this endpoint was called /holidays, but in the 4rth it was renamed to /requests, but we decided to dont rename it
        app.get('/holidays', verifyToken, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (dbType === "Mongo") {
                    const requestsJson = yield getRequestsRowsFromMango();
                    const approvedOrRejectedRequests = yield getApprovedOrRejectedRequestsFromMango();
                    relevantHolidays = [];
                    const dates = requestsJson.map(request => {
                        return {
                            startDate: request.startDate,
                            endDate: request.endDate
                        };
                    });
                    holidays.forEach(holiday => {
                        dates.forEach(date => {
                            if (areIntervalsOverlapping({ start: new Date(holiday.date), end: new Date(holiday.date) }, { start: new Date(date.startDate), end: new Date(date.endDate) })) {
                                relevantHolidays.push(holiday);
                            }
                        });
                    });
                    res.render('holidays', { requestsJson, approvedOrRejectedRequests, successMessage, relevantHolidays });
                }
                else if (dbType === "sql") {
                    const requestsJson = yield getRequestsRows();
                    const approvedOrRejectedRequests = yield getApprovedOrRejectedRequestsRows();
                    relevantHolidays = [];
                    const dates = requestsJson.map(request => {
                        return {
                            startDate: request.startDate,
                            endDate: request.endDate
                        };
                    });
                    holidays.forEach(holiday => {
                        dates.forEach(date => {
                            if (areIntervalsOverlapping({ start: new Date(holiday.date), end: new Date(holiday.date) }, { start: new Date(date.startDate), end: new Date(date.endDate) })) {
                                relevantHolidays.push(holiday);
                            }
                        });
                    });
                    res.render('holidays', { requestsJson, approvedOrRejectedRequests, successMessage, relevantHolidays });
                }
            }
            catch (error) {
                console.error('Error fetching requests:', error);
                res.status(500).send('Internal Server Error');
            }
        }));
        app.post('/approve-reject-holiday', verifyToken, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idOfEmployee = parseInt(req.body.idOfEmployee);
                const action = req.body.action;
                const requestId = parseInt(req.body.requestId);
                if (dbType === "Mongo") {
                    const request = yield getOneRequestInMango(requestId);
                    const remainingHolidays = yield getEmployeeRemainingHolidaysFromMango(idOfEmployee);
                    const { startDate, endDate } = yield getDatesOfOneRequestInMongo(requestId);
                    const holidayLength = differenceInDays(endDate, startDate);
                    const leftHolidays = remainingHolidays - holidayLength;
                    if (request) {
                        if (action === 'approve') {
                            yield approveRequestInMango(requestId, leftHolidays, idOfEmployee, startDate, endDate);
                            successMessage = 'Holiday request approved successfully!';
                            res.redirect('/holidays');
                        }
                        else if (action === 'reject') {
                            yield rejectRequestInMango(requestId, idOfEmployee, startDate, endDate);
                            successMessage = 'Holiday request rejected successfully!';
                            res.redirect('/holidays');
                        }
                        else if (action === 'update') {
                            res.redirect(`/update-request?requestId=${requestId}`);
                        }
                    }
                    else {
                        res.status(404).send('Request not found');
                    }
                }
                else if (dbType === "sql") {
                    const request = yield getOneRequest(requestId);
                    const remainingHolidays = yield getEmployeeRemainingHolidays(idOfEmployee);
                    const { startDate, endDate } = yield getDatesOfOneRequest(requestId);
                    const holidayLength = differenceInDays(endDate, startDate);
                    const leftHolidays = remainingHolidays - holidayLength;
                    if (request) {
                        if (action === 'approve') {
                            yield approveRequest(requestId, leftHolidays, idOfEmployee, startDate, endDate);
                            successMessage = 'Holiday request approved successfully!';
                            res.redirect('/holidays');
                        }
                        else if (action === 'reject') {
                            yield rejectRequest(requestId, idOfEmployee, startDate, endDate);
                            successMessage = 'Holiday request rejected successfully!';
                            res.redirect('/holidays');
                        }
                        else if (action === 'update') {
                            res.redirect(`/update-request?requestId=${requestId}`);
                        }
                    }
                    else {
                        res.status(404).send('Request not found');
                    }
                }
            }
            catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        }));
        app.get('/add-holiday', verifyToken, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (dbType === "Mongo") {
                    const employeesJson = yield getEmployeeRowsFromMango();
                    res.render('add-holiday', { failMessage, holidays, employeesJson });
                }
                else if (dbType === "sql") {
                    const employeesJson = yield getEmployeeRows();
                    res.render('add-holiday', { failMessage, holidays, employeesJson });
                }
            }
            catch (error) {
                res.status(500).send(error);
            }
        }));
        app.post("/add-holiday", verifyToken, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const employeeId = parseInt(req.body.employeeId);
            const startDate = req.body.startDate;
            const endDate = req.body.endDate;
            if (dbType === "Mongo") {
                if (yield checkDatesFromMango(employeeId, startDate, endDate)) {
                    yield addOneRequestToMango(employeeId, startDate, endDate);
                    successMessage = "Holiday request created successfully!";
                    res.redirect('/holidays');
                }
                else {
                    res.redirect('/add-holiday');
                }
            }
            else if (dbType === "sql") {
                if (yield checkDates(employeeId, startDate, endDate)) {
                    yield addOneRequest(employeeId, startDate, endDate);
                    successMessage = "Holiday request created successfully!";
                    res.redirect('/holidays');
                }
                else {
                    res.redirect('/add-holiday');
                }
            }
        }));
        app.post('/submit-data', verifyToken, (req, res) => {
            dbType = req.body.dbType;
            res.redirect('/add-holiday');
        });
        app.get('/update-request', verifyToken, (req, res) => {
            try {
                const idOfRequest = Number(req.query.requestId);
                res.render('update-request', { idOfRequest: idOfRequest });
            }
            catch (error) {
                res.status(500).send(error);
            }
        });
        app.post('/update-request', verifyToken, (req, res) => {
            const startDate = req.body.startDate;
            const endDate = req.body.endDate;
            const id = Number(req.body.idOfRequest);
            if (dbType === "Mongo") {
                updateRequestInMongo(id, startDate, endDate);
            }
            else if (dbType === "sql") {
                updateRequest(id, startDate, endDate);
            }
            res.redirect('/holidays');
        });
    });
}
main();
