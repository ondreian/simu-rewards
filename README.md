# Daily Simutronic Rewards

**ALWAYS USE GITHUB SECRETS**

example usage with CRON:

```yaml
#.github/workflows/rewards.yml
name: rewards
on:
  schedule:
    - cron: "5 1 * * *"
jobs:
  login-account:
    runs-on: ubuntu-latest
    name: login account
    steps:
      - uses: ondreian/simu-rewards@v1
        with:
          account: ${{ secrets.ACCOUNT }}
          password: ${{ secrets.PASSWORD }}
```
