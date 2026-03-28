"""
CareMesh seed script.
Creates: 2 demo users, their profiles, resources table, sample health data.

Usage (from apps/api/ dir with DB running):
    python ../../infra/seed/seed.py
or:
    DATABASE_URL=postgresql+asyncpg://... python seed.py
"""
from __future__ import annotations

import asyncio
import os
import sys
from datetime import date, datetime, timedelta, timezone

# Make sure apps/api is on the path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
API_DIR = os.path.join(SCRIPT_DIR, "..", "..", "apps", "api")
sys.path.insert(0, API_DIR)

from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from models import (
    AccessibilityPreferences,
    HealthDailyMetrics,
    HealthSleepSession,
    Resource,
    User,
    UserProfile,
)
from settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


RESOURCES = [
    # student
    {"persona_type": "student", "category": "Mental Health", "title": "Student Counseling Services",
     "description": "Free confidential counseling for enrolled students", "url": ""},
    {"persona_type": "student", "category": "Academic", "title": "Academic Support Center",
     "description": "Tutoring, study skills, and test prep resources", "url": ""},
    {"persona_type": "student", "category": "Wellness", "title": "Campus Recreation Center",
     "description": "Gym, fitness classes, and wellness programs for students", "url": ""},
    {"persona_type": "student", "category": "Crisis", "title": "Crisis Text Line",
     "description": "Text HOME to 741741 for free crisis support 24/7", "url": "https://www.crisistextline.org"},
    # caregiver
    {"persona_type": "caregiver", "category": "Respite", "title": "ARCH National Respite Network",
     "description": "Find respite care services in your area", "url": "https://archrespite.org"},
    {"persona_type": "caregiver", "category": "Support Groups", "title": "Caregiver Action Network",
     "description": "Resources, education, and peer support for caregivers", "url": "https://www.caregiveraction.org"},
    {"persona_type": "caregiver", "category": "Mental Health", "title": "Caregiver Help Desk",
     "description": "1-855-227-3640 — free support line for caregivers", "url": ""},
    {"persona_type": "caregiver", "category": "Wellness", "title": "15-Minute Mindfulness for Caregivers",
     "description": "Quick guided meditations designed for busy caregivers", "url": ""},
    # older_adult
    {"persona_type": "older_adult", "category": "Community", "title": "AARP Community Connections",
     "description": "Connect with neighbors and local volunteer programs", "url": "https://www.aarp.org"},
    {"persona_type": "older_adult", "category": "Fitness", "title": "SilverSneakers",
     "description": "Free gym and fitness classes for Medicare members", "url": "https://www.silversneakers.com"},
    {"persona_type": "older_adult", "category": "Health", "title": "Senior Health & Wellness Hotline",
     "description": "1-800-677-1116 — Eldercare Locator for local resources", "url": ""},
    # accessibility_focused
    {"persona_type": "accessibility_focused", "category": "Technology", "title": "AbilityNet",
     "description": "Free digital accessibility support and technology adaptations", "url": "https://abilitynet.org.uk"},
    {"persona_type": "accessibility_focused", "category": "Legal", "title": "ADA National Network",
     "description": "Information and guidance on ADA rights and accommodations", "url": "https://adata.org"},
]


async def seed(db: AsyncSession) -> None:
    print("Seeding resources...")
    for r in RESOURCES:
        result = await db.execute(
            select(Resource).where(Resource.title == r["title"], Resource.persona_type == r["persona_type"])
        )
        if not result.scalar_one_or_none():
            db.add(Resource(**r))
    await db.flush()

    print("Creating demo users...")
    demo_users = [
        {
            "email": "student@caremesh.demo",
            "password": "demo1234",
            "role": "member",
            "profile": {
                "age_range": "18-24",
                "sex": "male",
                "height_cm": 175.0,
                "weight_kg": 70.0,
                "goal": "stress_reduction",
                "activity_level": "moderate",
                "dietary_style": "omnivore",
                "allergies": [],
                "persona_type": "student",
            },
        },
        {
            "email": "caregiver@caremesh.demo",
            "password": "demo1234",
            "role": "member",
            "profile": {
                "age_range": "35-44",
                "sex": "female",
                "height_cm": 163.0,
                "weight_kg": 65.0,
                "goal": "burnout_recovery",
                "activity_level": "low",
                "dietary_style": "omnivore",
                "allergies": [],
                "persona_type": "caregiver",
            },
        },
        {
            "email": "admin@caremesh.demo",
            "password": "admin1234",
            "role": "admin",
            "profile": None,
        },
    ]

    created_users = []
    for u_data in demo_users:
        result = await db.execute(select(User).where(User.email == u_data["email"]))
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                email=u_data["email"],
                hashed_password=pwd_context.hash(u_data["password"]),
                role=u_data["role"],
            )
            db.add(user)
            await db.flush()
            print(f"  Created user: {user.email} (id={user.id})")

            if u_data["profile"]:
                p = u_data["profile"]
                profile = UserProfile(user_id=user.id, **p)
                db.add(profile)
                db.add(AccessibilityPreferences(user_id=user.id))
        else:
            print(f"  User already exists: {user.email}")

        created_users.append(user)

    await db.flush()

    # Seed sample health data for demo users (last 7 days)
    print("Seeding sample health data...")
    import random
    today = date.today()
    for user in created_users[:2]:  # skip admin
        for i in range(7):
            day = today - timedelta(days=i)
            # Daily metrics
            stmt = pg_insert(HealthDailyMetrics).values(
                user_id=user.id,
                metric_date=day,
                steps=random.randint(4000, 12000),
                step_goal=8000,
                active_calories=random.randint(200, 600),
                total_calories=random.randint(1600, 2400),
                resting_hr=random.randint(58, 72),
                avg_hr=random.randint(65, 85),
                body_battery_high=random.randint(60, 95),
                body_battery_low=random.randint(20, 40),
                stress_avg=random.randint(20, 65),
                intensity_minutes_moderate=random.randint(0, 60),
                intensity_minutes_vigorous=random.randint(0, 30),
                floors_climbed=random.randint(0, 15),
                spo2_avg=round(random.uniform(96.0, 99.0), 1),
                hrv_weekly_avg=round(random.uniform(40.0, 80.0), 1),
                hrv_status="BALANCED",
                vo2_max=round(random.uniform(38.0, 52.0), 1),
                active_minutes=random.randint(15, 90),
                raw_json={"seeded": True},
                synced_at=datetime.now(timezone.utc),
            ).on_conflict_do_nothing(constraint="uq_daily_metrics_user_date")
            await db.execute(stmt)

            # Sleep
            sleep_duration = random.randint(5 * 3600, 8 * 3600)
            stmt = pg_insert(HealthSleepSession).values(
                user_id=user.id,
                sleep_date=day,
                sleep_start="22:30",
                sleep_end="06:30",
                duration_seconds=sleep_duration,
                deep_seconds=int(sleep_duration * 0.2),
                light_seconds=int(sleep_duration * 0.5),
                rem_seconds=int(sleep_duration * 0.25),
                awake_seconds=int(sleep_duration * 0.05),
                sleep_score=random.randint(65, 90),
                avg_spo2=round(random.uniform(95.0, 99.0), 1),
                avg_respiration=round(random.uniform(13.0, 17.0), 1),
                raw_json={"seeded": True},
                synced_at=datetime.now(timezone.utc),
            ).on_conflict_do_nothing(constraint="uq_sleep_sessions_user_date")
            await db.execute(stmt)

    await db.commit()
    print("Seed complete.")


async def main():
    engine = create_async_engine(settings.database_url, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    # Ensure tables exist
    from models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        await seed(db)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
