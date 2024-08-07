function genToken() {
  return Math.round(Math.random() * 999999999999) + "" + Date.now();
}

const {
  getTripsFromIdUser,
  getExpensesFromIdTrip,
  getSplitsFromIdExpenses,
} = require("./mySQL/queries");
const query = require("./mySQL/connection");

const getAndStructureData = async (id) => {
  // Get the trips info from the user_id
  const flatTrips = await query(getTripsFromIdUser(), [id]);

  // Check if there are no trips
  if (!flatTrips || flatTrips.length === 0) {
    return [];
  }

  // Restructure the trips data
  const trips = flatTrips.map((trip) => {
    const {
      budgetTotal,
      budgetHotel,
      budgetFood,
      budgetTransport,
      budgetActivities,
      budgetOther,
      homeCurrency,
      destination,
      destinationCurrency,
      startDate,
      endDate,
      startDateIncluded,
      endDateIncluded,
      id,
    } = trip;
    return {
      id,
      details: {
        budgetTotal,
        budgetHotel,
        budgetFood,
        budgetTransport,
        budgetActivities,
        budgetOther,
        homeCurrency,
        destination,
        destinationCurrency,
        dates: {
          startDate,
          endDate,
          startDateIncluded,
          endDateIncluded,
        },
      },
    };
  });

  // Get the expenses per trip from the trips_id
  const tripsWithExpenses = await Promise.all(
    trips.map(async (trip) => {
      const expenses = await query(getExpensesFromIdTrip(), [trip.id]);

      if (!expenses) {
        return { ...trip, expenses: [] };
      }

      // Restructure the expenses data
      const transformedExpenses = expenses.map((expense) => {
        const { fromValue, fromCurrency, toValue, toCurrency, split, ...rest } =
          expense;
        return {
          ...rest,
          split: Boolean(split),
          amount: {
            fromValue,
            fromCurrency,
            toValue,
            toCurrency,
          },
        };
      });
      return { ...trip, expenses: transformedExpenses };
    })
  );

  // Get splits per trip from the trips_id
  const tripsComplete = await Promise.all(
    tripsWithExpenses.map(async (trip) => {
      if (!trip.expenses || trip.expenses.length === 0) {
        return { ...trip, splits: [] };
      }
      const splits = [];

      // Go through each expense and see if there is a split
      for (const expense of trip.expenses) {
        const expenseSplits = await query(getSplitsFromIdExpenses(), [
          expense.id,
        ]);
        if (!expenseSplits) {
          return;
        }

        // If there are splits with this expense, push them into the array of splits and restructure data
        expenseSplits.forEach((split) => {
          const {
            fromValue,
            fromCurrency,
            toValue,
            toCurrency,
            paid,
            ...rest
          } = split;
          splits.push({
            ...rest,
            paid: Boolean(paid),
            amount: {
              fromValue,
              fromCurrency,
              toValue,
              toCurrency,
            },
          });
        });
      }

      return { ...trip, splits };
    })
  );
  return tripsComplete;
};

const withinThreeHours = (timestamp) => {
  const currentTime = Date.now();
  const timeDifference = currentTime - timestamp;
  if (timeDifference > 10800) {
    return false;
  }
  return true;
};

module.exports = { getAndStructureData, withinThreeHours, genToken };
