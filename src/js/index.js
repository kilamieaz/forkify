// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';
/** Global state of the app
 * - search object 
 * - current recipe object
 * - shopping list object
 * - liked recipes
 */
const state = {};

/**
 * search controller
 */
const controlSearch = async () => {
    // get query from view
    const query = searchView.getInput();
    if (query) {
        // new search object and add to state
        state.search = new Search(query);
        // prepare UI for results
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchRes);

        try {
            // search for recipes
            await state.search.getResults();
            // clear loader
            clearLoader();
            // render results on UI
            searchView.renderResults(state.search.result); 
        } catch (error) {
            alert('Something wrong with the search...');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResult();
        searchView.renderResults(state.search.result, goToPage); 
        console.log(goToPage);
    }
});

/**
 * Recipe controller
 */

const controlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');
    // console.log(id);
    if (id) {
        // prepare UI for changes
        recipeView.clearResult();
        renderLoader(elements.recipe);
        // create new recipe object
        state.recipe = new Recipe(id);
        // TESTING
        window.r = state.recipe;
        try {
            // get recipe data and parse ingredients
            await state.recipe.getRecipe();
            // console.log(state.recipe.ingredients);
            state.recipe.parseIngredients();
            // calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            // render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
            // console.log(state.recipe);
        } catch (error) {
            alert('Error processing recipe!');
        }
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));