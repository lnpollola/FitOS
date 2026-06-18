# FitOS: adaptive nutrition and training companion

## Intent

Build a mobile-first application that unifies wearable activity data, nutrition intake, and strength training plans into a single adaptive system for fat-loss and body recomposition.

The product should help a user understand:

- how much energy they expend each day
- how much energy they ingest from meals and diet plans
- whether they are actually maintaining a calorie deficit
- how their training load, recovery, and nutrition interact over time

The application should not be just a calorie tracker. It should act as a guided decision layer that converts raw health data into weekly plan adjustments.

## Problem

Users typically have fragmented health data:

- wearable data lives in the apple watch data vendor app
- nutrition plans live in PDF files or chats
- gym routines live in notes, spreadsheets, or coaches' messages
- weight-loss decisions are made manually without a reliable energy balance model

This fragmentation makes it hard to answer simple questions:

- Am I really in a deficit?
- Am I eating according to my plan?
- Is my training aligned with my recovery and goal?
- Should calories, macros, or training load change this week?

## Vision

Create a cloud-connected mobile app that:

1. syncs wearable and dashboard data
2. parses diet PDFs into meals, calories, fats, protein, carbs, and other important nutrition metrics
3. estimates calories burned from daily activity and exercise
4. compares burned vs ingested calories over time
5. adapts the plan toward sustainable weight loss with a controlled deficit
6. stores strength plans, machines, loads, routines, and progress history
7. supports coach-guided plans and future collaborative editing

## MVP scope

### 1. Activity ingestion
- Import daily metrics from apple watch/dashboard integrations
- Normalize steps, heart rate, active calories, training sessions, sleep, and weight where available
- Store historical daily aggregates

### 2. Nutrition ingestion
- Upload PDF diet plans
- Extract meals, portions, kcal, protein, carbs, fats, and fiber when present
- Detect missing nutrition fields and flag low-confidence parsing
- Allow manual correction after extraction

### 3. Energy balance
- Compute estimated total expenditure
- Compute intake from planned meals and logged meals
- Show daily and weekly burned vs ingested balance
- Explain whether the user is in surplus, maintenance, or deficit

### 4. Adaptive fat-loss planning
- Define target weight-loss pace
- Recommend an initial calorie deficit
- Adjust target intake weekly using trend weight, adherence, and activity
- Prevent aggressive reductions when recovery or training load worsens

### 5. Strength training
- Store routines by day
- Track machines, exercises, sets, reps, load, and progression
- Associate routines with a broader objective such as fat loss with strength retention

### 6. Mobile + cloud
- Mobile app as the main experience
- Cloud database for cross-device sync and long-term follow-up
- User timeline with nutrition, activity, weight, and training history

## Non-goals for v1
- Full medical diagnosis
- Real-time coaching chatbot as the main interface
- Computer vision meal recognition
- Advanced hormone or blood-marker interpretation
- Full marketplace for coaches

## Product principles
- Behavior-first recommendations, not just dashboards
- Human-correctable data extraction
- Explainable calorie and adaptation logic
- Weekly plan review over noisy day-to-day fluctuations
- Safe defaults for deficit and load progression

## Key risks to explore
- Wearable integration quality and vendor fragmentation
- Accuracy of PDF nutrition extraction
- Differences between estimated and actual calorie expenditure
- Adherence vs prescribed meal plan
- Privacy and health-data compliance requirements
- How to model coach-authored training plans cleanly