import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCachedData } from "@/lib/redis";

interface ClinicalTrialStudy {
    protocolSection?: {
        identificationModule?: {
            nctId?: string;
            briefTitle?: string;
        };
        statusModule?: {
            overallStatus?: string;
            lastUpdatePostDateStruct?: {
                date?: string;
            };
        };
        designModule?: {
            phases?: string[];
        };
        descriptionModule?: {
            briefSummary?: string;
        };
        conditionsModule?: {
            conditions?: string[];
        };
        contactsLocationsModule?: {
            locations?: Array<{
                facility?: string;
                city?: string;
                country?: string;
            }>;
        };
    };
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const query = req.nextUrl.searchParams.get("query");
        const status = req.nextUrl.searchParams.get("status") || "recruiting";

        if (!query) {
            return NextResponse.json(
                { error: "Search query is required" },
                { status: 400 }
            );
        }

        const cacheKey = `trials:${query}:${status}`;
        const trials = await getCachedData(
            cacheKey,
            async () => {
                const statusMap: Record<string, string> = {
                    recruiting: "RECRUITING",
                    not_yet_recruiting: "NOT_YET_RECRUITING",
                    active: "ACTIVE_NOT_RECRUITING",
                    completed: "COMPLETED",
                };

                const apiStatus = statusMap[status] || "RECRUITING";
                const url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(query)}&filter.overallStatus=${apiStatus}&pageSize=20&format=json`;

                const response = await fetch(url, {
                    headers: { Accept: "application/json" },
                    next: { revalidate: 3600 },
                });

                if (!response.ok) {
                    throw new Error("ClinicalTrials.gov API error");
                }

                const data = await response.json();

                return (data.studies || []).map((study: ClinicalTrialStudy) => {
                    const protocol = study.protocolSection;
                    const identification = protocol?.identificationModule;
                    const statusModule = protocol?.statusModule;
                    const design = protocol?.designModule;
                    const description = protocol?.descriptionModule;
                    const conditions = protocol?.conditionsModule;
                    const locations = protocol?.contactsLocationsModule?.locations;

                    const firstLocation = locations?.[0];

                    return {
                        id: identification?.nctId || "",
                        title: identification?.briefTitle || "Untitled",
                        status: statusModule?.overallStatus || "Unknown",
                        phase: design?.phases?.join(", ") || "",
                        conditions: conditions?.conditions || [],
                        description: description?.briefSummary || "",
                        url: `https://clinicaltrials.gov/study/${identification?.nctId}`,
                        location: firstLocation
                            ? `${firstLocation.facility || ""}, ${firstLocation.city || ""}, ${firstLocation.country || ""}`.replace(/^, |, $/g, "")
                            : "",
                        lastUpdated:
                            statusModule?.lastUpdatePostDateStruct?.date || "",
                    };
                });
            },
            1800 // Cache 30 minutes
        );

        return NextResponse.json({ trials });
    } catch (error) {
        console.error("Clinical trials search error:", error);
        return NextResponse.json(
            { error: "Failed to search clinical trials. Please try again." },
            { status: 500 }
        );
    }
}
