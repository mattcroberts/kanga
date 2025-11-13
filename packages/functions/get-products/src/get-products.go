package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"strconv"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type Product struct {
	ProductID   string  `json:"productId"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Description string  `json:"description,omitempty"`
}

// mapDynamoItemsToProducts converts DynamoDB items to Product DTOs
func mapDynamoItemsToProducts(items []map[string]types.AttributeValue) []Product {
	products := make([]Product, 0, len(items))

	for _, item := range items {
		product := Product{}

		if v, ok := item["productId"]; ok {
			if s, ok := v.(*types.AttributeValueMemberS); ok {
				product.ProductID = s.Value
			}
		}

		if v, ok := item["name"]; ok {
			if s, ok := v.(*types.AttributeValueMemberS); ok {
				product.Name = s.Value
			}
		}

		if v, ok := item["price"]; ok {
			if n, ok := v.(*types.AttributeValueMemberN); ok {
				price, _ := strconv.ParseFloat(n.Value, 64)
				product.Price = price
			}
		}

		if v, ok := item["description"]; ok {
			if s, ok := v.(*types.AttributeValueMemberS); ok {
				product.Description = s.Value
			}
		}

		products = append(products, product)
	}

	return products
}

func HandleRequest(ctx context.Context, event events.APIGatewayV2HTTPRequest) (events.APIGatewayProxyResponse, error) {

	dbHost := os.Getenv("DB_HOST")

	cfg, err := config.LoadDefaultConfig(ctx)

	if err != nil {
		log.Println("Error loading config:", err)
		return events.APIGatewayProxyResponse{
			Body:       `{ "error": "Failed to load AWS config" }`,
			StatusCode: 500,
		}, nil
	}

	svc := dynamodb.NewFromConfig(cfg, func(o *dynamodb.Options) {
		if dbHost != "" {
			o.BaseEndpoint = aws.String(dbHost)
		}
	})

	productsResponse, err := svc.Scan(ctx, &dynamodb.ScanInput{
		TableName: aws.String("kanga_products"),
	})

	if err != nil {
		log.Println("Error querying DynamoDB:", err)
		return events.APIGatewayProxyResponse{
			Body:       err.Error(),
			StatusCode: 500,
		}, nil
	}

	// Map DynamoDB items to Product DTOs
	products := mapDynamoItemsToProducts(productsResponse.Items)

	out, err := json.Marshal(products)

	if err != nil {
		log.Println("Error marshalling products:", err)
		return events.APIGatewayProxyResponse{
			Body:       err.Error(),
			StatusCode: 500,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		Body:       string(out),
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
