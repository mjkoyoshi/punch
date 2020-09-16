# 概要

## 必須要件

 - Mac OS
 - Node.js 10.*
 - yarn

## インストール

```:bash
git clone https://github.com/mjkoyoshi/punch.git
cd punch
yarn install
```

## 環境変数 

`.env_sample` をディレクトリ直下にコピーして以下の環境変数を `.env` ファイルに設定する。

| 環境変数       | 概要                                 | 必須  |  
| ------------- | ----------------------------------- | ---- |
| PUNCH_SITE    | 打刻サイトのURL                       | ✓    |
| USER_ID       | 打刻サイトのID   　　　　　　　　        | ✓    |
| PASSWD        | 打刻サイトのパスワード                  | ✓    |
| VPN_NAME      | VPNの名前                            |      |
| NO_VPN_IP     | VPNを使用しない場合のグローバルIPアドレス |      |

## 使用方法

クローンしたディレクトリを `PATH` 環境変数に登録する

### 出勤打刻

```:bash
punch -i
```

または

```:bash
shukkin
```

### 退勤打刻

```:bash
punch -o
```

または

```:bash
taikin
```

### 打刻時間の参照

直近10個の打刻時間を参照する場合

```:bash
punch -s
```

すべての打刻時間を参照する場合

```:bash
punch -a
```
