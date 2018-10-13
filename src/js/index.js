// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader } from './views/base';
/** Global state of the app
 * - search object 
 * - current recipe object
 * - shopping list object
 * - liked recipes
 */
const state = {};
window.state = state;
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
        // highlight selected search item
        if (state.search) searchView.highlightSelected(id);
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

/**
 * List controller
 */
const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();
    // add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    // handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *' )) {
        // delete from state
        state.list.deleteItem(id);
        // delete from UI
        listView.deleteItem(id);
    // handle the count update
    } else if (e.target.matches('.shopping__count-value, .shopping__count-value *')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

// final
// ['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease button is clicked
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            // console.log(state.recipe);
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button is clicked
        state.recipe.updateServings('inc');
        // console.log(state.recipe);
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    }
});

window.l = new List();