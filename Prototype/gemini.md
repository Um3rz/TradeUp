# Project: TradeUp - Stock Trading Simulation Platform

## 1. Project Overview

TradeUp is a stock trading simulation platform designed to provide users with a hands-on learning experience in stock trading without any financial risk. The platform will use real-time stock market data to create a realistic and engaging environment for users to practice and improve their trading skills.

## 2. Technology Stack

-   **Frontend:** Next.js
-   **Backend:** NestJS with Fastify

## 3. System Actors

-   **Stock Trading User:** The end-user of the platform who learns and practices trading.
-   **System Admin:** A user with administrative privileges to manage the platform and its users.

## 4. Key Features

### Core Functionality

-   **User Authentication:** Secure sign-up and login for users.
-   **Stock Trading:** Ability to simulate buying and selling stocks.
-   **Portfolio Management:** Users can view their owned stocks, profit and loss (PnL), and overall portfolio performance.
-   **Watchlist:** Users can track stocks they are interested in.
-   **Virtual Wallet:** Users will have a virtual wallet to manage their funds for trading.

### AI-Powered Features

-   **AI Insights & Chatbot:** An AI assistant to provide stock market trends, news, and answer user queries.
-   **AI News Sentiment Analysis:** The platform will analyze news sentiment to provide insights.

### Gamification and Social Features

-   **Gamified Leaderboard:** A leaderboard to rank users based on their trading performance.
-   **Community Channels:** Topic-specific channels for users to chat and interact with each other.

### Other Features

-   **Candlestick Charts:** Interactive charts for stock analysis.
-   **Educational Content:** Resources to help users learn about stock trading.
-   **Personalized Notifications:** A system to notify users about important events.

## 5. Data Requirements

-   **Live Stock Market Data:** To be sourced from PSXTerminal.
-   **Historical Stock Market Data:** For model training, from Kaggle.
-   **AI Model:** A model will be trained to predict next-day stock returns (regression) or whether the stock will go up/down (classification). The primary model architecture will be Gradient-Boosted Trees (LightGBM/XGBoost).

## 6. Non-Functional Requirements

-   **Performance:** The system should be responsive, with the AI model having a response time of no more than 5s.
-   **Availability:** The system should have an uptime of 99%.
-   **Usability:** The UI should adhere to best practices like Jakob Nielsen's 10 usability heuristics.
-   **Maintainability:** The code should be modular, clean, and easy to maintain.

## 7. Security Requirements

-   The application will be designed to mitigate common security risks, including those from the OWASP Top 10 list.
-   Sensitive data will be encrypted both in transit and at rest.


## Prototype phase 
Prototype Use Cases: Phase—1
 
Requirements
Sr#
Use Case Name
1
Sign up / Login (Trader)
Login (Admin)
2
View Stock Market Overview (see performance of popular stocks, as a list)
3
View watchlisted stocks

 
 
·  	Prototype Use Cases: Phase—2
 
 
Requirements
Sr#
Use Case Name
4
View and interact with candlestick chart of a stock (see summary statistics in this view too)
5
Purchase a stock
6
Sell a stock
7
View portfolio of purchased stocks

 
 

