# Daily Simutronic Rewards

**ALWAYS USE GITHUB SECRETS**

Secret to be used for account and password are required, game is optional but defaults to GS3. Be sure to set repository to private to avoid Github's cron disabling if no activity within 60 days limitation.
Game Code Options:
* GS3 - Gemstone Prime
* GST - Gemstone Test
* GSX - Gemstone Platinum
* GSF - Gemstone Shattered
* DR  - DragonRealms Prime
* DRT - DragonRealms Test
* DRX - DragonRealms Platinum
* DRF - DragonRealms Fallen

example usage with CRON (Times in UTC):

```yaml
#.github/workflows/rewards.yml
name: rewards
on:
  workflow_dispatch:
  schedule:
    - cron: "5 1 * * *"
jobs:
  login-account:
    runs-on: ubuntu-latest
    name: login account
    timeout-minutes: 5
    steps:
      - uses: ondreian/simu-rewards@v1.1.0
        with:
          account: ${{ secrets.ACCOUNT1 }}
          password: ${{ secrets.PASSWORD1 }}
      - uses: ondreian/simu-rewards@v1.1.0
        with:
          account: ${{ secrets.ACCOUNT2 }}
          password: ${{ secrets.PASSWORD2 }}
          game: ${{ secrets.GAMECODE2 }}
```
