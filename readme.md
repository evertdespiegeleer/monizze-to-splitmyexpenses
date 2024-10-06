This is a very crude program to convert a [Monizze](https://www.monizze.be/) history into a [SplitMyExpenses](https://www.splitmyexpenses.com/) import csv file.

### Prepare your environment
```sh
npm ci
cp -n ./src/transactionFilter.example.ts ./src/transactionFilter.ts
```

Customize the `./src/transactionFilter.ts` file to your needs.

### Run the procedure

- [ ] Log in to Monizze in the browser (to obtain a token cookie)
- [ ] Point your browser to [https://happy.monizze.be/api/services/my-monizze/voucher/history/\<PAGE\>/0/emv](https://happy.monizze.be/api/services/my-monizze/voucher/history/<PAGE>/0/emv), starting with \<PAGE\> = 0.
- [ ] Drop the entire contents into a json file in ./monizze-history, eg: ./monizze-history/0.json
- [ ] Repeat with \<PAGE\> = 1, 2, 3... for the time range you need
- [ ] `npm run start`
- [ ] You should find a splitmyexpenses import file in ./sme-import.\<datetimestamp\>.csv
- [ ] Import csv at [https://app.splitmyexpenses.com/expenses-uploads/create](https://app.splitmyexpenses.com/expenses-uploads/create), use date format mm/dd/yyyy

### Potential improvements
- [ ] Guide the user through the procedure. Don't read Monizze history from files but ask the user to open a link in their browser and drop the response in the CLI