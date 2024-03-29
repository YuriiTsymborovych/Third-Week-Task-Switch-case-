var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
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
fetchHolidays(2024, 'UA')
    .then((holidaysData) => {
    holidays.push(...holidaysData);
})
    .catch((error) => {
    console.error('An error occurred while receiving holidays:', error);
});
export { holidays };
