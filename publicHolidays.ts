import axios, {AxiosResponse} from "axios";

interface Holiday {
    date: string;
    localName: string;
    name: string;
    countryCode: string;
}
async function fetchHolidays(year: number, countryCode: string): Promise<Holiday[]> {
    try {
        const response: AxiosResponse<Holiday[]> = await axios.get<Holiday[]>(`https://date.nager.at/api/v3/publicholidays/${year}/${countryCode}`);
        return response.data;
    } catch (error) {
        console.error('An error occurred while executing the request:', error);
        return [];
    }
}

const holidays: Holiday[] = [];
fetchHolidays(2024, 'UA')
    .then((holidaysData: Holiday[]) => {
        holidays.push(...holidaysData);
    })
    .catch((error) => {
        console.error('An error occurred while receiving holidays:', error);
    });

export {
    holidays,
    Holiday
}