# Daily Simutronic Rewards

** ALWAYS USE GITHUB SECRETS **

example usage with CRON:

```yaml
name: rewards
on:
  schedule:
    - cron: "5 1 * * *"
jobs:
  login-account:
    runs-on: ubuntu-latest
    name: login account
    steps:
      - uses: ondreian/simu-rewards@main
        with:
          account: ${{ secrets.ACCOUNT }}
          password: ${{ secrets.PASSWORD }}
```
