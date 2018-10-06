import axios from 'axios';

export default class Search {
    constructor(query) {
        this.query = query;
    }
    async getResults() {
        const proxy = 'https://cors.io/?';
        const key = '8f6f435cc79dae77f6b61b3878c15ed8';
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
        } catch(error) {
            alert(error);
        }
    }
}
