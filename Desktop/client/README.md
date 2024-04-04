這個專案作用是什麼？

個人Github Blog文章與留言瀏覽網頁
1.作者可以更新專案內的文章標題與內容
2.展示作者專案內的文章
3.展示文章內的留言


如何運行這個專案?
1.打開專案路徑 client/blog 運行npm install react-scripts --save-dev
2.專案路徑 client 運行 npm start (開啟 Express 服務器)
3.專案路徑 client/blog 運行npm start (本地端會打開一個loaclhost:3000的網站)


專案架構介紹

這個專案是使用 Express 框架的 Node.js 服務器，用於處理 Github OAuth 授權和獲取用户數據的请求，在Express服務器中使用 cors 來允許跨域請求以及 body-parser 來解析JSON數據。它的主要功能包括：
1.獲取訪問令牌  '/getAccessToken' ：獲取 Github 訪問令牌，以便後續使用 Github API 進行用戶數據的獲取。
2.獲取用戶數據  '/getUserData' ：使用 Github API 獲取已授權用户的數據，包括用户名、用户 ID 等信息。


而前端採用React.js作為框架主要功能有：
1.Github 登入：用户可以點擊按鈕使用 Github 登入，並授權並授權儲藏庫資訊。
2.選擇儲藏庫：可以選擇作者的儲藏庫，並會於下方顯示文章。
3.文章展示：根據用戶的選擇會左側會展示文章的標題及內容右側會展示文章的留言。
4.文章編輯＆新增功能：只有作者會顯示出編輯＆新增功能，並可對其進行操作。
5.滾動加載：每次只會顯示10篇文章滾動到底部後加載更多直到沒有。

這個應用通過調用 Github API 來獲取用戶儲藏庫和文章數據，並使用 Octokit 庫來進行 Github 相關操作。另外，還使用了 Markdown 庫来渲染問題和評論的内容。