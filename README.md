# Daily Simutronic Rewards

**ALWAYS USE GITHUB SECRETS**

Secret to be used for account and password are required, gamecode is optional but defaults to GS3.
Game Code Options:
* GS3 - Gemstone Prime
* GST - Gemstone Test
* GSX - Gemstone Platinum
* GSF - Gemstone Shattered
* DR  - DragonRealms Prime
* DRT - DragonRealms Test
* DRX - DragonRealms Platinum
* DRF - DragonRealms Fallen

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
          account: ${{ secrets.ACCOUNT1 }}
          password: ${{ secrets.PASSWORD1 }}
      - uses: ondreian/simu-rewards@v1
        with:
          account: ${{ secrets.ACCOUNT2 }}
          password: ${{ secrets.PASSWORD2 }}
          game_code: ${{ secrets.GAMECODE2 }}
```
