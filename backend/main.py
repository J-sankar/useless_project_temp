from fastapi import FastAPI

app = FastAPI()


@app.post("/")
def read_root(count:int):
    return {"message": "Hello World", "count": count}
