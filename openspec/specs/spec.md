# Proposal: Adaptive health tracking foundation

## Intent

Create the initial foundation for a mobile-first health application that combines wearable activity data, nutrition plans from PDF documents, energy balance tracking, and strength-training routines to support sustainable fat loss.

## Scope

In scope:
- ingest wearable or dashboard activity data
- upload and parse diet PDFs
- calculate nutrition metrics from meals and plans
- calculate burned versus ingested calories
- define a safe calorie-deficit plan for weight loss
- persist user history in a cloud-backed data model
- support strength routines with exercises, machines, loads, and progression

Out of scope:
- direct medical diagnosis
- automatic meal recognition from photos
- advanced biomarker interpretation
- complete coach marketplace
- broad social features

## Approach

Start with a domain-first architecture and behavior-first specs.

Define system behavior across six domains:
- activity ingestion
- nutrition ingestion
- energy balance
- adaptive planning
- strength training
- mobile sync

Defer integration-specific decisions until an explore step validates data-source quality, parsing reliability, and privacy constraints.

## Success criteria

The system should allow a user to:
- import activity data and see normalized daily metrics
- upload a diet PDF and obtain editable structured nutrition data
- compare calories burned versus calories ingested by day and week
- receive a recommended calorie target for fat loss
- track gym routines and strength progression
- review all history from a mobile application backed by cloud sync

## Risks

- wearable provider fragmentation
- unreliable calorie-burn estimates
- ambiguous PDF structure and OCR quality
- mismatch between planned diet and real adherence
- health-data privacy and consent requirements
- insufficient explainability of automatic plan adjustments