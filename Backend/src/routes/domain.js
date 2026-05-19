import express from "express";
import Domain from "../models/Domain.js";

const router = express.Router();

//
// GET ALL CATEGORIES
//
router.get("/", async (req, res) => {
    try {

        const domains = await Domain.find().sort({
            createdAt: -1,
        });

        res.json(domains);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to fetch domains",
        });
    }
});

//
// CREATE CATEGORY
//
router.post("/", async (req, res) => {

    try {

        const { category } = req.body;

        if (!category) {
            return res.status(400).json({
                message: "Category required",
            });
        }

        const newDomain = await Domain.create({
            category,
            domains: [],
        });

        res.status(201).json(newDomain);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to create category",
        });
    }
});

//
// UPDATE CATEGORY
//
router.put("/:id", async (req, res) => {

    try {

        const { category } = req.body;

        const updated = await Domain.findByIdAndUpdate(
            req.params.id,
            {
                category,
            },
            {
                new: true,
            }
        );

        res.json(updated);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to update category",
        });
    }
});

//
// DELETE CATEGORY
//
router.delete("/:id", async (req, res) => {

    try {

        await Domain.findByIdAndDelete(
            req.params.id
        );

        res.json({
            success: true,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to delete category",
        });
    }
});

//
// ADD DOMAIN
//
router.post("/:id/domains", async (req, res) => {

    try {

        const { name } = req.body;

        const category =
            await Domain.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        category.domains.push(name);

        await category.save();

        res.json(category);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to add domain",
        });
    }
});

//
// UPDATE DOMAIN
//
router.put("/:id/domains/:index", async (req, res) => {

    try {

        const { name } = req.body;

        const category =
            await Domain.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        category.domains[
            req.params.index
        ] = name;

        await category.save();

        res.json(category);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to update domain",
        });
    }
});

//
// DELETE DOMAIN
//
router.delete(
    "/:id/domains/:index",
    async (req, res) => {

        try {

            const category =
                await Domain.findById(
                    req.params.id
                );

            if (!category) {
                return res.status(404).json({
                    message:
                        "Category not found",
                });
            }

            category.domains.splice(
                req.params.index,
                1
            );

            await category.save();

            res.json(category);

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message:
                    "Failed to delete domain",
            });
        }
    }
);

export default router;