# Design Spec: Codebase Understanding - I-FEST Management System

**Date:** 2026-07-11
**Author:** Claude Code

## 1. Overview
This document serves as a comprehensive summary of the I-FEST Management System (IMS) codebase as of July 2026. The system is designed to handle the annual turnover of committee members at HMTI Universitas Tadulako by centralizing documents, meetings, KPIs, and tasks.

## 2. Architecture & Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email/Password)
- **Styling:** Tailwind CSS v4
- **Email:** Brevo API
- **Infrastructure:** Vercel (Frontend/API), Render (Background Jobs)

## 3. Core Modules

### 3.1 Auth & RBAC
- **Middleware:** Syncs session with Supabase.
- **RBAC:** Dynamic roles based on `level` stored in the database.
- **Security:** Triple layer (Middleware, Server Action validation, RLS fallback).

### 3.2 Document Management
- **Workflow:** `requested` -> `processed` -> `sent`.
- **Features:** Revision history, PDF storage, automated notifications.

### 3.3 Meeting Planner
- **Types:** Scheduled (Division) and Ad-hoc (Individual/Cross-division).
- **Notes:** Integrated digital notes with decisions and action items.

### 3.4 KPI & Tasks
- **Hierarchy:** Division -> KPI -> Task.
- **Progress:** Calculated dynamically based on task completion.

## 4. Database Schema
- **Structure:** 13 core tables scoped by `committee_year_id`.
- **Zero Hardcode:** Organizations, roles, and divisions are all dynamic.

## 5. Maintenance Path
- New year creation via Admin Dashboard copies structure but clears personnel.
- Environment variables managed in Vercel.
