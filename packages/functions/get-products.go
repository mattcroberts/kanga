package main

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type Product struct {
	ID    string  `json:"id"`
	Title string  `json:"title"`
	Price float64 `json:"price"`
}

func HandleRequest(ctx context.Context, event events.APIGatewayV2HTTPRequest) (events.APIGatewayProxyResponse, error) {
	products := []Product{
		{ID: "123", Title: "Product 123", Price: 456},
		{ID: "123", Title: "Product 123", Price: 456},
		{ID: "123", Title: "Product 123", Price: 456},
		{ID: "123", Title: "Product 123", Price: 456},
		{ID: "123", Title: "Product 123", Price: 456},
		{ID: "123", Title: "Product 123", Price: 456},
		{ID: "123", Title: "Product 123", Price: 456},
		{ID: "123", Title: "Product 123", Price: 456},
	}
	out, err := json.Marshal(products)

	if err != nil {
		panic(err)
	}

	return events.APIGatewayProxyResponse{
		Body:       string(out),
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
